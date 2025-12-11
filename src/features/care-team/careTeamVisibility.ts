// src/features/care-team/careTeamVisibility.ts

export type CareTeamRole = "coach" | "clinician" | "supporter";

export interface CareTeamVisibilityRule {
  role: CareTeamRole;
  label: string;
  shortLabel: string;
  description: string;
  disclaimer: string;
  
  // Visibility capabilities (flattened for easy access)
  canSeeHighLevelWellbeing: boolean;
  canSeeFunctionalIndex: boolean;
  canSeeDerivedTrends: boolean;
  canSeeAdherenceBreakdown: boolean;
  canSeeRawLogs: boolean;
  canSeeMealDetails: boolean;
  canSeeMoodLogs: boolean;
  canSeeMedicalDocuments: boolean;
  canUseSecureMessaging: boolean;
}

/**
 * Single, canonical mapping of what each role can see.
 * Any change here should be reflected in ACCESS_MODEL.md.
 */
export const CARE_TEAM_VISIBILITY_RULES: Record<CareTeamRole, CareTeamVisibilityRule> = {
  coach: {
    role: "coach",
    label: "Coach",
    shortLabel: "Coach",
    description:
      "Coaches can see your Functional Wellness Index, adherence, and trends to guide training and habit change. They do not see raw meal logs, workout notes, or medical documents by default.",
    disclaimer:
      "Coaches see high-level functional trends only. They do not see your raw logs or medical documents.",
    
    // Visibility
    canSeeHighLevelWellbeing: true,
    canSeeFunctionalIndex: true,
    canSeeDerivedTrends: true,
    canSeeAdherenceBreakdown: true,
    canSeeRawLogs: false,
    canSeeMealDetails: false,
    canSeeMoodLogs: false,
    canSeeMedicalDocuments: false,
    canUseSecureMessaging: true,
  },
  clinician: {
    role: "clinician",
    label: "Clinician",
    shortLabel: "Clinician",
    description:
      "Clinicians can see your Functional Wellness Index and trend summaries to support clinical decision-making. They do not see raw diaries or medical documents by default and should not rely on Wellio for diagnosis.",
    disclaimer:
      "Clinicians see derived functional indicators, not PHI or medical records. Wellio does not replace clinical diagnosis.",
    
    // Visibility
    canSeeHighLevelWellbeing: true,
    canSeeFunctionalIndex: true,
    canSeeDerivedTrends: true,
    canSeeAdherenceBreakdown: true,
    canSeeRawLogs: false,
    canSeeMealDetails: false,
    canSeeMoodLogs: false,
    canSeeMedicalDocuments: false,
    canUseSecureMessaging: true,
  },
  supporter: {
    role: "supporter",
    label: "Supporter",
    shortLabel: "Supporter",
    description:
      "Supporters (friends, family, colleagues) can see only high-level wellbeing summaries. They cannot access functional scores, trends, or any detailed health data.",
    disclaimer:
      "Supporters see only high-level wellbeing status. No detailed health data is shared.",
    
    // Visibility
    canSeeHighLevelWellbeing: true,
    canSeeFunctionalIndex: false,
    canSeeDerivedTrends: false,
    canSeeAdherenceBreakdown: false,
    canSeeRawLogs: false,
    canSeeMealDetails: false,
    canSeeMoodLogs: false,
    canSeeMedicalDocuments: false,
    canUseSecureMessaging: true,
  },
};

/**
 * Helper: get rules for a role.
 */
export function getVisibilityRule(role: CareTeamRole): CareTeamVisibilityRule {
  return CARE_TEAM_VISIBILITY_RULES[role];
}
