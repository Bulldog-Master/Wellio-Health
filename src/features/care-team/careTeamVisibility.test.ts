import { describe, it, expect } from 'vitest';
import {
  CARE_TEAM_VISIBILITY_RULES,
  getVisibilityRule,
  type CareTeamRole,
} from './careTeamVisibility';

/**
 * These tests enforce the access model documented in ACCESS_MODEL.md.
 * If any test fails, it means someone changed visibility rules without
 * updating the canonical documentation.
 * 
 * DO NOT modify these tests without also updating ACCESS_MODEL.md.
 */
describe('Care Team Visibility Rules', () => {
  describe('Coach Role', () => {
    const coachRules = CARE_TEAM_VISIBILITY_RULES.coach;

    it('can see Functional Wellness Index', () => {
      expect(coachRules.capabilities.canSeeFunctionalIndex).toBe(true);
    });

    it('can see trends (14-30 day)', () => {
      expect(coachRules.capabilities.canSeeTrends).toBe(true);
    });

    it('can see adherence breakdown', () => {
      expect(coachRules.capabilities.canSeeAdherenceBreakdown).toBe(true);
    });

    it('CANNOT see raw logs (meal notes, workout notes, journals)', () => {
      expect(coachRules.capabilities.canSeeRawLogs).toBe(false);
    });

    it('CANNOT see medical documents', () => {
      expect(coachRules.capabilities.canSeeMedicalDocuments).toBe(false);
    });

    it('can use secure messaging', () => {
      expect(coachRules.capabilities.canUseSecureMessaging).toBe(true);
    });
  });

  describe('Clinician Role', () => {
    const clinicianRules = CARE_TEAM_VISIBILITY_RULES.clinician;

    it('can see Functional Wellness Index', () => {
      expect(clinicianRules.capabilities.canSeeFunctionalIndex).toBe(true);
    });

    it('can see trends (14-30 day)', () => {
      expect(clinicianRules.capabilities.canSeeTrends).toBe(true);
    });

    it('can see adherence breakdown', () => {
      expect(clinicianRules.capabilities.canSeeAdherenceBreakdown).toBe(true);
    });

    it('CANNOT see raw logs (diaries, personal notes)', () => {
      expect(clinicianRules.capabilities.canSeeRawLogs).toBe(false);
    });

    it('CANNOT see medical documents', () => {
      expect(clinicianRules.capabilities.canSeeMedicalDocuments).toBe(false);
    });

    it('can use secure messaging', () => {
      expect(clinicianRules.capabilities.canUseSecureMessaging).toBe(true);
    });
  });

  describe('Role Invariants', () => {
    const allRoles: CareTeamRole[] = ['coach', 'clinician'];

    it('no role can see raw logs by default', () => {
      allRoles.forEach((role) => {
        expect(CARE_TEAM_VISIBILITY_RULES[role].capabilities.canSeeRawLogs).toBe(false);
      });
    });

    it('no role can see medical documents by default', () => {
      allRoles.forEach((role) => {
        expect(CARE_TEAM_VISIBILITY_RULES[role].capabilities.canSeeMedicalDocuments).toBe(false);
      });
    });

    it('all roles can see functional wellness index', () => {
      allRoles.forEach((role) => {
        expect(CARE_TEAM_VISIBILITY_RULES[role].capabilities.canSeeFunctionalIndex).toBe(true);
      });
    });

    it('all roles have secure messaging enabled', () => {
      allRoles.forEach((role) => {
        expect(CARE_TEAM_VISIBILITY_RULES[role].capabilities.canUseSecureMessaging).toBe(true);
      });
    });

    it('all roles have a disclaimer defined', () => {
      allRoles.forEach((role) => {
        expect(CARE_TEAM_VISIBILITY_RULES[role].disclaimer).toBeTruthy();
        expect(typeof CARE_TEAM_VISIBILITY_RULES[role].disclaimer).toBe('string');
      });
    });
  });

  describe('getVisibilityRule helper', () => {
    it('returns correct rule for coach', () => {
      const rule = getVisibilityRule('coach');
      expect(rule.role).toBe('coach');
      expect(rule).toEqual(CARE_TEAM_VISIBILITY_RULES.coach);
    });

    it('returns correct rule for clinician', () => {
      const rule = getVisibilityRule('clinician');
      expect(rule.role).toBe('clinician');
      expect(rule).toEqual(CARE_TEAM_VISIBILITY_RULES.clinician);
    });
  });

  /**
   * FUTURE ROLE PLACEHOLDER
   * When adding new roles (e.g., 'supporter', 'family', 'colleague'),
   * add tests here to explicitly define what they can/cannot see.
   * This prevents accidental privilege escalation.
   */
});
