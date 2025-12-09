import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  FEATURE_FLAGS,
  isFeatureEnabled,
  setFeatureOverride,
  clearFeatureOverride,
  clearAllOverrides,
  getAllFeatureFlags,
  getFeatureFlagsByCategory,
} from '@/lib/featureFlags';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('Feature Flags', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('FEATURE_FLAGS definitions', () => {
    it('should have required properties for each flag', () => {
      Object.values(FEATURE_FLAGS).forEach(flag => {
        expect(flag).toHaveProperty('key');
        expect(flag).toHaveProperty('description');
        expect(flag).toHaveProperty('defaultValue');
        expect(flag).toHaveProperty('category');
      });
    });

    it('should have valid categories', () => {
      const validCategories = ['core', 'social', 'medical', 'enterprise', 'experimental'];
      Object.values(FEATURE_FLAGS).forEach(flag => {
        expect(validCategories).toContain(flag.category);
      });
    });
  });

  describe('isFeatureEnabled', () => {
    it('should return default value when no override exists', () => {
      const enabled = isFeatureEnabled('AI_WORKOUT_COMPANION');
      expect(enabled).toBe(FEATURE_FLAGS.AI_WORKOUT_COMPANION.defaultValue);
    });

    it('should return false for experimental features by default', () => {
      const enabled = isFeatureEnabled('WEARABLE_SYNC');
      expect(enabled).toBe(false);
    });
  });

  describe('setFeatureOverride', () => {
    it('should override feature flag value', () => {
      // Default is false
      expect(isFeatureEnabled('WEARABLE_SYNC')).toBe(false);
      
      // Override to true
      setFeatureOverride('WEARABLE_SYNC', true);
      expect(isFeatureEnabled('WEARABLE_SYNC')).toBe(true);
    });

    it('should persist override in localStorage', () => {
      setFeatureOverride('TELEHEALTH', true);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('clearFeatureOverride', () => {
    it('should remove specific override', () => {
      setFeatureOverride('WEARABLE_SYNC', true);
      expect(isFeatureEnabled('WEARABLE_SYNC')).toBe(true);
      
      clearFeatureOverride('WEARABLE_SYNC');
      expect(isFeatureEnabled('WEARABLE_SYNC')).toBe(false); // Back to default
    });
  });

  describe('clearAllOverrides', () => {
    it('should remove all overrides', () => {
      setFeatureOverride('WEARABLE_SYNC', true);
      setFeatureOverride('TELEHEALTH', true);
      
      clearAllOverrides();
      
      expect(isFeatureEnabled('WEARABLE_SYNC')).toBe(false);
      expect(isFeatureEnabled('TELEHEALTH')).toBe(false);
    });
  });

  describe('getAllFeatureFlags', () => {
    it('should return all flags with current status', () => {
      const flags = getAllFeatureFlags();
      expect(flags.length).toBe(Object.keys(FEATURE_FLAGS).length);
      
      flags.forEach(flag => {
        expect(flag).toHaveProperty('enabled');
        expect(flag).toHaveProperty('hasOverride');
      });
    });

    it('should mark overridden flags', () => {
      setFeatureOverride('WEARABLE_SYNC', true);
      
      const flags = getAllFeatureFlags();
      const wearableFlag = flags.find(f => f.key === 'wearable_sync');
      
      expect(wearableFlag?.hasOverride).toBe(true);
    });
  });

  describe('getFeatureFlagsByCategory', () => {
    it('should filter flags by category', () => {
      const coreFlags = getFeatureFlagsByCategory('core');
      const socialFlags = getFeatureFlagsByCategory('social');
      const experimentalFlags = getFeatureFlagsByCategory('experimental');
      
      expect(coreFlags.every(f => f.category === 'core')).toBe(true);
      expect(socialFlags.every(f => f.category === 'social')).toBe(true);
      expect(experimentalFlags.every(f => f.category === 'experimental')).toBe(true);
    });

    it('should include correct flags in each category', () => {
      const coreFlags = getFeatureFlagsByCategory('core');
      const coreKeys = coreFlags.map(f => f.key);
      
      expect(coreKeys).toContain('ai_workout_companion');
      expect(coreKeys).toContain('ai_nutrition_analysis');
    });
  });
});
