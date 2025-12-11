// src/features/care-team/careTeamVisibility.ts

export type CareTeamRole = "coach" | "clinician" | "supporter";

/**
 * CareTeamVisibilityModel describes what each role can see.
 * This is the single source of truth for derived visibility rules.
 */
export interface CareTeamVisibilityModel {
  // High-level "is this person okay?" signal
  canSeeHighLevelWellbeing?: boolean;

  // Core wellness signals
  canSeeFunctionalIndex: boolean;
  canSeeDerivedTrends: boolean;

  // Raw logs (never granted to care team in Wellio)
  canSeeRawLogs: boolean;
  canSeeMealDetails: boolean;
  canSeeMoodLogs: boolean;

  // Medical documents / vault
  canSeeMedicalDocuments: boolean;
}

/**
 * CARE_TEAM_VISIBILITY_RULES
 *
 * These rules are enforced across:
 * - UI rendering
 * - API/edge-function responses
 * - Future access logging / auditing
 *
 * They should NEVER be loosened casually. See tests in careTeamVisibility.test.ts.
 */
export const CARE_TEAM_VISIBILITY_RULES: Record<CareTeamRole, CareTeamVisibilityModel> = {
  coach: {
    // Coaches can see meaningful trends and functional scores.
    canSeeHighLevelWellbeing: true,
    canSeeFunctionalIndex: true,
    canSeeDerivedTrends: true,

    // They never see raw logs or vault content.
    canSeeRawLogs: false,
    canSeeMealDetails: false,
    canSeeMoodLogs: false,
    canSeeMedicalDocuments: false,
  },

  clinician: {
    // Clinicians can also see functional signals and trends.
    canSeeHighLevelWellbeing: true,
    canSeeFunctionalIndex: true,
    canSeeDerivedTrends: true,

    // The system is intentionally designed to avoid PHI exposure.
    canSeeRawLogs: false,
    canSeeMealDetails: false,
    canSeeMoodLogs: false,
    canSeeMedicalDocuments: false,
  },

  supporter: {
    // Friends, family, colleagues: "supporter" role.
    // They ONLY see a high-level wellbeing signal (e.g., OK / struggling),
    // never numeric FWI or detailed trends.
    canSeeHighLevelWellbeing: true,

    // No direct access to FWI/trends or anything that looks like PHI.
    canSeeFunctionalIndex: false,
    canSeeDerivedTrends: false,

    // Absolutely no raw logs or medical documents.
    canSeeRawLogs: false,
    canSeeMealDetails: false,
    canSeeMoodLogs: false,
    canSeeMedicalDocuments: false,
  },
};

/**
 * getVisibilityForRole
 *
 * Convenience helper to centralize how visibility is resolved.
 */
export function getVisibilityForRole(role: CareTeamRole): CareTeamVisibilityModel {
  return CARE_TEAM_VISIBILITY_RULES[role];
}

/**
 * Helper: get rules for a role (alias for backward compatibility).
 */
export function getVisibilityRule(role: CareTeamRole): CareTeamVisibilityModel {
  return CARE_TEAM_VISIBILITY_RULES[role];
}
