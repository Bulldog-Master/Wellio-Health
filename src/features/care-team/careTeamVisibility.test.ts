import { describe, it, expect } from "vitest";
import {
  CARE_TEAM_VISIBILITY_RULES,
  getVisibilityForRole,
  CareTeamRole,
} from "./careTeamVisibility";

describe("CARE_TEAM_VISIBILITY_RULES", () => {
  const roles: CareTeamRole[] = ["coach", "clinician", "supporter"];

  it("all roles have a defined visibility model", () => {
    roles.forEach((role) => {
      const vis = CARE_TEAM_VISIBILITY_RULES[role];
      expect(vis).toBeDefined();
    });
  });

  it("coach has correct visibility restrictions", () => {
    const coach = getVisibilityForRole("coach");

    expect(coach.canSeeHighLevelWellbeing).toBe(true);
    expect(coach.canSeeFunctionalIndex).toBe(true);
    expect(coach.canSeeDerivedTrends).toBe(true);

    // Privacy boundaries
    expect(coach.canSeeRawLogs).toBe(false);
    expect(coach.canSeeMealDetails).toBe(false);
    expect(coach.canSeeMoodLogs).toBe(false);
    expect(coach.canSeeMedicalDocuments).toBe(false);
  });

  it("clinician visibility remains restricted to functional patterns", () => {
    const clinician = getVisibilityForRole("clinician");

    expect(clinician.canSeeHighLevelWellbeing).toBe(true);
    expect(clinician.canSeeFunctionalIndex).toBe(true);
    expect(clinician.canSeeDerivedTrends).toBe(true);

    // Zero-PHI guarantees
    expect(clinician.canSeeRawLogs).toBe(false);
    expect(clinician.canSeeMealDetails).toBe(false);
    expect(clinician.canSeeMoodLogs).toBe(false);
    expect(clinician.canSeeMedicalDocuments).toBe(false);
  });

  it("supporters (friends/family/colleagues) see only high-level summaries", () => {
    const supporter = getVisibilityForRole("supporter");

    expect(supporter.canSeeHighLevelWellbeing).toBe(true);

    // They must NOT see functional index or trends.
    expect(supporter.canSeeFunctionalIndex).toBe(false);
    expect(supporter.canSeeDerivedTrends).toBe(false);

    // And absolutely no raw logs or medical documents.
    expect(supporter.canSeeRawLogs).toBe(false);
    expect(supporter.canSeeMealDetails).toBe(false);
    expect(supporter.canSeeMoodLogs).toBe(false);
    expect(supporter.canSeeMedicalDocuments).toBe(false);
  });
});
