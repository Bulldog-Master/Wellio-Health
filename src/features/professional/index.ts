/**
 * Unified Professional Module Export
 * 
 * This module consolidates all professional-related functionality:
 * - src/features/pro/ - Feature logic (dashboards, billing, sessions)
 * - src/components/professional/ - Reusable UI components
 * 
 * Import professional functionality from this single entry point:
 * import { PatientsPanel, ApplicationForm, useClinicianPatients } from '@/features/professional';
 */

// Re-export all professional features
export * from '../pro';

// Re-export all professional components
export {
  ApplicationForm,
  ApprovedDashboard,
  StatusBadge,
  InviteCodeManager,
  PendingRequests,
  JoinByCode,
} from '../../components/professional';

export type {
  ProfessionalApplication,
  ProfessionalClient,
  ProfessionalFormData,
  ProfessionalType,
} from '../../components/professional/types';
