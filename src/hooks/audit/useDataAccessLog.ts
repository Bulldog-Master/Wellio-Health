import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AccessType = 'fwi' | 'trends' | 'adherence' | 'summary' | 'messaging_metadata_free_view' | 'profile_view' | 'dashboard_view';
export type AccessRole = 'supporter' | 'coach' | 'clinician';

interface LogAccessParams {
  clientId: string;
  accessType: AccessType;
  role: AccessRole;
  context?: Record<string, unknown>;
}

interface UseDataAccessLogReturn {
  logAccess: (params: LogAccessParams) => Promise<{ success: boolean; logId?: string; error?: string }>;
  logFwiView: (clientId: string, role: AccessRole) => Promise<void>;
  logTrendsView: (clientId: string, role: AccessRole) => Promise<void>;
  logAdherenceView: (clientId: string, role: AccessRole) => Promise<void>;
  logDashboardView: (clientId: string, role: AccessRole) => Promise<void>;
}

/**
 * Hook for logging data access events for audit compliance.
 * 
 * Every time a professional (coach, clinician) or supporter views
 * derived wellness data, we log the access for transparency and compliance.
 * 
 * @example
 * ```tsx
 * const { logFwiView, logTrendsView } = useDataAccessLog();
 * 
 * // In your component when viewing FWI data
 * useEffect(() => {
 *   if (clientId && role) {
 *     logFwiView(clientId, role);
 *   }
 * }, [clientId, role]);
 * ```
 */
export function useDataAccessLog(): UseDataAccessLogReturn {
  const logAccess = useCallback(async (params: LogAccessParams) => {
    const { clientId, accessType, role, context } = params;

    try {
      const { data, error } = await supabase.functions.invoke('log-data-access', {
        body: {
          clientId,
          accessType,
          role,
          context,
        },
      });

      if (error) {
        console.error('[useDataAccessLog] Failed to log access:', error);
        return { success: false, error: error.message };
      }

      return { success: true, logId: data?.logId };
    } catch (err) {
      console.error('[useDataAccessLog] Exception logging access:', err);
      return { success: false, error: 'Failed to log data access' };
    }
  }, []);

  const logFwiView = useCallback(async (clientId: string, role: AccessRole) => {
    await logAccess({ clientId, accessType: 'fwi', role, context: { view: 'fwi_score' } });
  }, [logAccess]);

  const logTrendsView = useCallback(async (clientId: string, role: AccessRole) => {
    await logAccess({ clientId, accessType: 'trends', role, context: { view: 'trend_analysis' } });
  }, [logAccess]);

  const logAdherenceView = useCallback(async (clientId: string, role: AccessRole) => {
    await logAccess({ clientId, accessType: 'adherence', role, context: { view: 'adherence_metrics' } });
  }, [logAccess]);

  const logDashboardView = useCallback(async (clientId: string, role: AccessRole) => {
    await logAccess({ clientId, accessType: 'dashboard_view', role, context: { view: 'professional_dashboard' } });
  }, [logAccess]);

  return {
    logAccess,
    logFwiView,
    logTrendsView,
    logAdherenceView,
    logDashboardView,
  };
}
