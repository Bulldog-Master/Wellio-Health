import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecurityAudit } from '../utils/useSecurityAudit';

interface AnomalyPattern {
  type: 'failed_login' | 'unusual_time' | 'rapid_requests' | 'new_device' | 'geo_anomaly' | 'privilege_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
}

interface LoginAttempt {
  success: boolean;
  timestamp: Date;
  userAgent?: string;
}

const FAILED_LOGIN_THRESHOLD = 5;
const FAILED_LOGIN_WINDOW_MINUTES = 15;
const RAPID_REQUEST_THRESHOLD = 100;
const RAPID_REQUEST_WINDOW_SECONDS = 60;

export const useAnomalyDetection = () => {
  const { logSecurityEvent, logSecurityViolation } = useSecurityAudit();

  // Store for tracking patterns (in-memory for session)
  const getRequestLog = (): number[] => {
    try {
      const stored = sessionStorage.getItem('request_timestamps');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const setRequestLog = (timestamps: number[]) => {
    try {
      sessionStorage.setItem('request_timestamps', JSON.stringify(timestamps));
    } catch {
      // Ignore storage errors
    }
  };

  const getFailedLogins = (): LoginAttempt[] => {
    try {
      const stored = localStorage.getItem('failed_login_attempts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const setFailedLogins = (attempts: LoginAttempt[]) => {
    try {
      localStorage.setItem('failed_login_attempts', JSON.stringify(attempts));
    } catch {
      // Ignore storage errors
    }
  };

  const logAnomaly = useCallback(async (pattern: AnomalyPattern) => {
    console.warn('[Security Anomaly Detected]', pattern);
    
    await logSecurityEvent({
      action: `anomaly_${pattern.type}`,
      resource_type: 'security_anomaly',
      severity: pattern.severity,
      metadata: pattern.details,
    });

    // For critical anomalies, also log as violation
    if (pattern.severity === 'critical') {
      await logSecurityViolation(pattern.type, pattern.details);
    }

    return pattern;
  }, [logSecurityEvent, logSecurityViolation]);

  const trackLoginAttempt = useCallback(async (success: boolean, userAgent?: string) => {
    const now = new Date();
    const attempts = getFailedLogins();
    
    if (!success) {
      // Add failed attempt
      attempts.push({
        success: false,
        timestamp: now,
        userAgent,
      });
      setFailedLogins(attempts);

      // Check for brute force pattern
      const windowStart = new Date(now.getTime() - FAILED_LOGIN_WINDOW_MINUTES * 60 * 1000);
      const recentFailures = attempts.filter(
        a => !a.success && new Date(a.timestamp) > windowStart
      );

      if (recentFailures.length >= FAILED_LOGIN_THRESHOLD) {
        await logAnomaly({
          type: 'failed_login',
          severity: 'high',
          details: {
            failed_attempts: recentFailures.length,
            window_minutes: FAILED_LOGIN_WINDOW_MINUTES,
            user_agent: userAgent,
          },
        });
        return { blocked: true, reason: 'Too many failed login attempts' };
      }
    } else {
      // Clear failed attempts on successful login
      setFailedLogins([]);
    }

    return { blocked: false };
  }, [logAnomaly]);

  const trackRequest = useCallback(async (endpoint: string) => {
    const now = Date.now();
    const timestamps = getRequestLog();
    
    // Clean old timestamps
    const windowStart = now - RAPID_REQUEST_WINDOW_SECONDS * 1000;
    const recentTimestamps = timestamps.filter(t => t > windowStart);
    recentTimestamps.push(now);
    setRequestLog(recentTimestamps);

    // Check for rapid requests
    if (recentTimestamps.length >= RAPID_REQUEST_THRESHOLD) {
      await logAnomaly({
        type: 'rapid_requests',
        severity: 'medium',
        details: {
          request_count: recentTimestamps.length,
          window_seconds: RAPID_REQUEST_WINDOW_SECONDS,
          endpoint,
        },
      });
      return { throttle: true };
    }

    return { throttle: false };
  }, [logAnomaly]);

  const checkUnusualLoginTime = useCallback(async (userId: string) => {
    const hour = new Date().getHours();
    
    // Consider 2 AM - 5 AM as unusual hours
    if (hour >= 2 && hour < 5) {
      // Check if user has logged in at this time before
      const { data: recentLogins } = await supabase
        .from('security_logs')
        .select('created_at')
        .eq('user_id', userId)
        .eq('event_type', 'auth_login')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(20);

      const nightLogins = recentLogins?.filter(l => {
        const loginHour = new Date(l.created_at).getHours();
        return loginHour >= 2 && loginHour < 5;
      });

      if (!nightLogins || nightLogins.length < 2) {
        await logAnomaly({
          type: 'unusual_time',
          severity: 'low',
          details: {
            login_hour: hour,
            historical_night_logins: nightLogins?.length || 0,
          },
        });
      }
    }
  }, [logAnomaly]);

  const checkNewDevice = useCallback(async (userId: string, deviceFingerprint: string) => {
    // Check if this device has been seen before
    const { data: knownDevices } = await supabase
      .from('trusted_devices')
      .select('device_fingerprint')
      .eq('user_id', userId);

    const isKnown = knownDevices?.some(d => d.device_fingerprint === deviceFingerprint);

    if (!isKnown) {
      await logAnomaly({
        type: 'new_device',
        severity: 'low',
        details: {
          device_fingerprint: deviceFingerprint.substring(0, 8) + '...', // Partial for privacy
          known_devices_count: knownDevices?.length || 0,
        },
      });
      return { isNew: true };
    }

    return { isNew: false };
  }, [logAnomaly]);

  const checkPrivilegeEscalation = useCallback(async (
    userId: string,
    requestedRole: string,
    currentRole?: string
  ) => {
    // Check if user is attempting to access higher privilege level
    const roleHierarchy: Record<string, number> = {
      'user': 1,
      'moderator': 2,
      'admin': 3,
    };

    const requestedLevel = roleHierarchy[requestedRole] || 0;
    const currentLevel = currentRole ? (roleHierarchy[currentRole] || 1) : 1;

    if (requestedLevel > currentLevel) {
      await logAnomaly({
        type: 'privilege_escalation',
        severity: 'critical',
        details: {
          user_id: userId,
          requested_role: requestedRole,
          current_role: currentRole || 'user',
          attempted_escalation: requestedLevel - currentLevel,
        },
      });
      return { blocked: true, reason: 'Privilege escalation attempt detected' };
    }

    return { blocked: false };
  }, [logAnomaly]);

  const getSecurityScore = useCallback(async (userId: string): Promise<number> => {
    // Calculate a security score based on recent anomalies
    const { data: recentAnomalies } = await supabase
      .from('security_logs')
      .select('event_data')
      .eq('user_id', userId)
      .like('event_type', 'anomaly_%')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (!recentAnomalies || recentAnomalies.length === 0) {
      return 100; // Perfect score
    }

    const severityWeights: Record<string, number> = {
      'low': 2,
      'medium': 5,
      'high': 15,
      'critical': 30,
    };

    const totalPenalty = recentAnomalies.reduce((sum, a) => {
      const eventData = a.event_data as Record<string, unknown> | null;
      const severity = (eventData?.severity as string) || 'low';
      return sum + (severityWeights[severity] || 0);
    }, 0);

    return Math.max(0, 100 - totalPenalty);
  }, []);

  return {
    trackLoginAttempt,
    trackRequest,
    checkUnusualLoginTime,
    checkNewDevice,
    checkPrivilegeEscalation,
    getSecurityScore,
    logAnomaly,
  };
};
