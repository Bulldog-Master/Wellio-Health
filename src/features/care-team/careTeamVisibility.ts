// src/features/care-team/careTeamVisibility.ts

export type CareTeamRole = "coach" | "clinician" | "supporter";

export interface CareTeamVisibilityCapabilities {
  /** Can view high-level wellbeing status (e.g., "doing well", "needs support") */
  canSeeHighLevelWellbeing: boolean;
  /** Can view the Functional Wellness Index (FWI) for the user */
  canSeeFunctionalIndex: boolean;
  /** Can view trend lines (14–30 day) built from scores */
  canSeeDerivedTrends: boolean;
  /** Can view adherence breakdown (activity, meals, hydration, sleep, mood) */
  canSeeAdherenceBreakdown: boolean;
  /** Can view detailed raw logs (per-meal notes, per-workout notes, journals) */
  canSeeRawLogs: boolean;
  /** Can view meal details (specific foods, portions, notes) */
  canSeeMealDetails: boolean;
  /** Can view mood logs and emotional tracking */
  canSeeMoodLogs: boolean;
  /** Can view uploaded medical documents or vault contents */
  canSeeMedicalDocuments: boolean;
  /** Can initiate/read secure messaging with the user (E2EE, PQ + cMixx) */
  canUseSecureMessaging: boolean;
}

export interface CareTeamVisibilityRule {
  role: CareTeamRole;
  label: string;
  shortLabel: string;
  description: string;
  capabilities: CareTeamVisibilityCapabilities;
  /** One-line disclaimer for UI / legal copy */
  disclaimer: string;
}

/**
 * Single, canonical mapping of what each role can see.
 * Any change here should be reflected in ACCESS_MODEL.md.
 */
export const CARE_TEAM_VISIBILITY_RULES: Record<
  CareTeamRole,
  CareTeamVisibilityRule
> = {
  coach: {
    role: "coach",
    label: "Coach",
    shortLabel: "Coach",
    description:
      "Coaches can see your Functional Wellness Index, adherence, and trends to guide training and habit change. They do not see raw meal logs, workout notes, or medical documents by default.",
    capabilities: {
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
    disclaimer:
      "Coaches see high-level functional trends only. They do not see your raw logs or medical documents.",
  },
  clinician: {
    role: "clinician",
    label: "Clinician",
    shortLabel: "Clinician",
    description:
      "Clinicians can see your Functional Wellness Index and trend summaries to support clinical decision-making. They do not see raw diaries or medical documents by default and should not rely on Wellio for diagnosis.",
    capabilities: {
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
    disclaimer:
      "Clinicians see derived functional indicators, not PHI or medical records. Wellio does not replace clinical diagnosis.",
  },
  supporter: {
    role: "supporter",
    label: "Supporter",
    shortLabel: "Supporter",
    description:
      "Supporters (friends, family, colleagues) can see only high-level wellbeing summaries. They cannot access functional scores, trends, or any detailed health data.",
    capabilities: {
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
    disclaimer:
      "Supporters see only high-level wellbeing status. No detailed health data is shared.",
  },
};

/**
 * Helper: get rules for a role.
 */
export function getVisibilityRule(role: CareTeamRole): CareTeamVisibilityRule {
  return CARE_TEAM_VISIBILITY_RULES[role];
}
