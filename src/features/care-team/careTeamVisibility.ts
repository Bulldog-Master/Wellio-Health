// src/features/care-team/careTeamVisibility.ts

export type CareTeamRole = "coach" | "clinician" | "supporter";

export interface CareTeamVisibilityModel {
  canSeeHighLevelWellbeing?: boolean;
  canSeeFunctionalIndex: boolean;
  canSeeDerivedTrends: boolean;
  canSeeRawLogs: boolean;
  canSeeMealDetails: boolean;
  canSeeMoodLogs: boolean;
  canSeeMedicalDocuments: boolean;
}

export const CARE_TEAM_VISIBILITY_RULES: Record<CareTeamRole, CareTeamVisibilityModel> = {
  coach: {
    canSeeHighLevelWellbeing: true,
    canSeeFunctionalIndex: true,
    canSeeDerivedTrends: true,
    canSeeRawLogs: false,
    canSeeMealDetails: false,
    canSeeMoodLogs: false,
    canSeeMedicalDocuments: false,
  },
  clinician: {
    canSeeHighLevelWellbeing: true,
    canSeeFunctionalIndex: true,
    canSeeDerivedTrends: true,
    canSeeRawLogs: false,
    canSeeMealDetails: false,
    canSeeMoodLogs: false,
    canSeeMedicalDocuments: false,
  },
  supporter: {
    // Friends / family / colleagues
    canSeeHighLevelWellbeing: true,
    canSeeFunctionalIndex: false,
    canSeeDerivedTrends: false,
    canSeeRawLogs: false,
    canSeeMealDetails: false,
    canSeeMoodLogs: false,
    canSeeMedicalDocuments: false,
  },
};

/**
 * Helper: get rules for a role.
 */
export function getVisibilityRule(role: CareTeamRole): CareTeamVisibilityModel {
  return CARE_TEAM_VISIBILITY_RULES[role];
}
