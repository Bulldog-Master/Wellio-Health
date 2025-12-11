import { describe, it, expect } from "vitest";
import { CARE_TEAM_VISIBILITY_RULES, getVisibilityRule, type CareTeamRole } from "./careTeamVisibility";

/**
 * These tests enforce the access model documented in ACCESS_MODEL.md.
 * If any test fails, it means someone changed visibility rules without
 * updating the canonical documentation.
 * 
 * DO NOT modify these tests without also updating ACCESS_MODEL.md.
 */
describe("CARE_TEAM_VISIBILITY_RULES", () => {
  it("coach has correct visibility restrictions", () => {
    const coach = CARE_TEAM_VISIBILITY_RULES.coach.capabilities;
    expect(coach.canSeeFunctionalIndex).toBe(true);
    expect(coach.canSeeDerivedTrends).toBe(true);

    // Privacy boundaries
    expect(coach.canSeeRawLogs).toBe(false);
    expect(coach.canSeeMealDetails).toBe(false);
    expect(coach.canSeeMoodLogs).toBe(false);
    expect(coach.canSeeMedicalDocuments).toBe(false);
  });

  it("clinician visibility remains restricted to functional patterns", () => {
    const clinician = CARE_TEAM_VISIBILITY_RULES.clinician.capabilities;
    expect(clinician.canSeeFunctionalIndex).toBe(true);
    expect(clinician.canSeeDerivedTrends).toBe(true);

    // Zero-PHI guarantees
    expect(clinician.canSeeRawLogs).toBe(false);
    expect(clinician.canSeeMealDetails).toBe(false);
    expect(clinician.canSeeMoodLogs).toBe(false);
    expect(clinician.canSeeMedicalDocuments).toBe(false);
  });

  it("supporters (friends/family/colleagues) see only high-level summaries", () => {
    const supporter = CARE_TEAM_VISIBILITY_RULES.supporter.capabilities;

    expect(supporter.canSeeHighLevelWellbeing).toBe(true);

    // Restrictions
    expect(supporter.canSeeFunctionalIndex).toBe(false);
    expect(supporter.canSeeDerivedTrends).toBe(false);
    expect(supporter.canSeeRawLogs).toBe(false);
    expect(supporter.canSeeMedicalDocuments).toBe(false);
  });
});

describe("Role Invariants", () => {
  const allRoles: CareTeamRole[] = ["coach", "clinician", "supporter"];

  it("no role can see raw logs by default", () => {
    allRoles.forEach((role) => {
      expect(CARE_TEAM_VISIBILITY_RULES[role].capabilities.canSeeRawLogs).toBe(false);
    });
  });

  it("no role can see medical documents by default", () => {
    allRoles.forEach((role) => {
      expect(CARE_TEAM_VISIBILITY_RULES[role].capabilities.canSeeMedicalDocuments).toBe(false);
    });
  });

  it("no role can see meal details by default", () => {
    allRoles.forEach((role) => {
      expect(CARE_TEAM_VISIBILITY_RULES[role].capabilities.canSeeMealDetails).toBe(false);
    });
  });

  it("no role can see mood logs by default", () => {
    allRoles.forEach((role) => {
      expect(CARE_TEAM_VISIBILITY_RULES[role].capabilities.canSeeMoodLogs).toBe(false);
    });
  });

  it("all roles have secure messaging enabled", () => {
    allRoles.forEach((role) => {
      expect(CARE_TEAM_VISIBILITY_RULES[role].capabilities.canUseSecureMessaging).toBe(true);
    });
  });

  it("all roles have a disclaimer defined", () => {
    allRoles.forEach((role) => {
      expect(CARE_TEAM_VISIBILITY_RULES[role].disclaimer).toBeTruthy();
      expect(typeof CARE_TEAM_VISIBILITY_RULES[role].disclaimer).toBe("string");
    });
  });
});

describe("getVisibilityRule helper", () => {
  it("returns correct rule for coach", () => {
    const rule = getVisibilityRule("coach");
    expect(rule.role).toBe("coach");
    expect(rule).toEqual(CARE_TEAM_VISIBILITY_RULES.coach);
  });

  it("returns correct rule for clinician", () => {
    const rule = getVisibilityRule("clinician");
    expect(rule.role).toBe("clinician");
    expect(rule).toEqual(CARE_TEAM_VISIBILITY_RULES.clinician);
  });

  it("returns correct rule for supporter", () => {
    const rule = getVisibilityRule("supporter");
    expect(rule.role).toBe("supporter");
    expect(rule).toEqual(CARE_TEAM_VISIBILITY_RULES.supporter);
  });
});
