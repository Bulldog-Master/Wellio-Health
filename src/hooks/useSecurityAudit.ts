import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuditLogEntry {
  action: string;
  resource_type: string;
  resource_id?: string;
  metadata?: Record<string, unknown>;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

export const useSecurityAudit = () => {
  const logSecurityEvent = useCallback(async (entry: AuditLogEntry) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('security_logs').insert({
        user_id: user?.id,
        event_type: entry.action,
        event_data: {
          resource_type: entry.resource_type,
          resource_id: entry.resource_id,
          ...entry.metadata,
        },
        severity: entry.severity || 'low',
        ip_address: null, // Not stored for privacy
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, []);

  const logAuthEvent = useCallback((action: string, success: boolean, metadata?: Record<string, unknown>) => {
    return logSecurityEvent({
      action: `auth_${action}`,
      resource_type: 'auth',
      severity: success ? 'low' : 'medium',
      metadata: { success, ...metadata },
    });
  }, [logSecurityEvent]);

  const logDataAccess = useCallback((table: string, recordId: string, action: 'read' | 'write' | 'delete') => {
    return logSecurityEvent({
      action: `data_${action}`,
      resource_type: table,
      resource_id: recordId,
      severity: action === 'delete' ? 'medium' : 'low',
    });
  }, [logSecurityEvent]);

  const logSensitiveAccess = useCallback((resource: string, recordId?: string) => {
    return logSecurityEvent({
      action: 'sensitive_access',
      resource_type: resource,
      resource_id: recordId,
      severity: 'high',
    });
  }, [logSecurityEvent]);

  const logSecurityViolation = useCallback((violation: string, metadata?: Record<string, unknown>) => {
    return logSecurityEvent({
      action: 'security_violation',
      resource_type: violation,
      severity: 'critical',
      metadata,
    });
  }, [logSecurityEvent]);

  return {
    logSecurityEvent,
    logAuthEvent,
    logDataAccess,
    logSensitiveAccess,
    logSecurityViolation,
  };
};
