import { describe, it, expect } from "vitest";
import { CARE_TEAM_VISIBILITY_RULES } from "./careTeamVisibility";

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

  // Optional "supporter" role (friends/family/colleagues) once implemented
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
