import { useEffect, useRef } from 'react';
import { useDataAccessLog, AccessType, AccessRole } from '@/hooks/audit/useDataAccessLog';

interface DataAccessLoggerProps {
  /** The ID of the client/patient whose data is being viewed */
  clientId: string;
  /** The type of data being accessed */
  accessType: AccessType;
  /** The role of the viewer */
  role: AccessRole;
  /** Optional additional context for the audit log */
  context?: Record<string, unknown>;
  /** Children to render */
  children: React.ReactNode;
  /** Whether logging is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Wrapper component that automatically logs data access when mounted.
 * 
 * Use this to wrap any component that displays derived wellness data
 * to a professional or supporter. The access is logged once when the
 * component mounts.
 * 
 * @example
 * ```tsx
 * <DataAccessLogger
 *   clientId={patient.id}
 *   accessType="fwi"
 *   role="clinician"
 *   context={{ source: 'patient_dashboard' }}
 * >
 *   <PatientFWICard fwi={patient.fwi} />
 * </DataAccessLogger>
 * ```
 */
export function DataAccessLogger({
  clientId,
  accessType,
  role,
  context,
  children,
  enabled = true,
}: DataAccessLoggerProps) {
  const { logAccess } = useDataAccessLog();
  const hasLogged = useRef(false);

  useEffect(() => {
    // Only log once per mount and when enabled
    if (!enabled || hasLogged.current || !clientId) {
      return;
    }

    hasLogged.current = true;
    
    logAccess({
      clientId,
      accessType,
      role,
      context: {
        ...context,
        component: 'DataAccessLogger',
        mounted_at: new Date().toISOString(),
      },
    }).catch((err) => {
      console.error('[DataAccessLogger] Failed to log access:', err);
    });
  }, [clientId, accessType, role, context, enabled, logAccess]);

  // Reset the logged flag if key props change
  useEffect(() => {
    hasLogged.current = false;
  }, [clientId, accessType, role]);

  return <>{children}</>;
}

export default DataAccessLogger;
