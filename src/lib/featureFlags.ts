/**
 * Feature Flags System
 * 
 * Allows toggling features without deployments.
 * Flags can be configured via:
 * 1. Environment variables (VITE_FF_*)
 * 2. localStorage (for dev/testing)
 * 3. Database (future: for per-user/per-org flags)
 */

export interface FeatureFlag {
  key: string;
  description: string;
  defaultValue: boolean;
  category: 'core' | 'social' | 'medical' | 'enterprise' | 'experimental';
}

// Feature flag definitions
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // Core Wellness Features
  AI_WORKOUT_COMPANION: {
    key: 'ai_workout_companion',
    description: 'AI-powered real-time workout coaching',
    defaultValue: true,
    category: 'core',
  },
  AI_NUTRITION_ANALYSIS: {
    key: 'ai_nutrition_analysis',
    description: 'AI-powered food analysis and nutrition insights',
    defaultValue: true,
    category: 'core',
  },
  PREDICTIVE_INJURY_PREVENTION: {
    key: 'predictive_injury_prevention',
    description: 'AI-based injury risk prediction',
    defaultValue: true,
    category: 'core',
  },
  EMOTION_FITNESS_ENGINE: {
    key: 'emotion_fitness_engine',
    description: 'Emotion and fitness correlation tracking',
    defaultValue: true,
    category: 'core',
  },

  // Social Features
  LIVE_WORKOUT_SESSIONS: {
    key: 'live_workout_sessions',
    description: 'Real-time group workout sessions',
    defaultValue: true,
    category: 'social',
  },
  VIDEO_POSTS: {
    key: 'video_posts',
    description: 'Allow video uploads in social feed',
    defaultValue: true,
    category: 'social',
  },
  MICRO_CHALLENGES: {
    key: 'micro_challenges',
    description: 'Quick viral fitness challenges',
    defaultValue: true,
    category: 'social',
  },

  // Medical Features
  MEDICAL_RECORDS: {
    key: 'medical_records',
    description: 'Medical records storage and tracking',
    defaultValue: true,
    category: 'medical',
  },
  QUANTUM_ENCRYPTION: {
    key: 'quantum_encryption',
    description: 'Quantum-resistant encryption for sensitive data',
    defaultValue: true,
    category: 'medical',
  },
  CMIX_MESSAGING: {
    key: 'cmix_messaging',
    description: 'XX Network cMix for metadata protection',
    defaultValue: true,
    category: 'medical',
  },

  // Enterprise Features
  TRAINER_PORTAL: {
    key: 'trainer_portal',
    description: 'Professional trainer/coach workspace',
    defaultValue: true,
    category: 'enterprise',
  },
  PRACTITIONER_PORTAL: {
    key: 'practitioner_portal',
    description: 'Medical practitioner workspace',
    defaultValue: true,
    category: 'enterprise',
  },
  TELEHEALTH: {
    key: 'telehealth',
    description: 'Telehealth consultation features',
    defaultValue: false, // Not yet implemented
    category: 'enterprise',
  },

  // Experimental Features
  WEARABLE_SYNC: {
    key: 'wearable_sync',
    description: 'Suunto and other wearable device sync',
    defaultValue: false, // Awaiting API credentials
    category: 'experimental',
  },
  ENVIRONMENTAL_FITNESS: {
    key: 'environmental_fitness',
    description: 'Weather and air quality fitness recommendations',
    defaultValue: false,
    category: 'experimental',
  },
  VERIFIED_ACHIEVEMENTS: {
    key: 'verified_achievements',
    description: 'Cryptographically signed workout achievements',
    defaultValue: false,
    category: 'experimental',
  },
} as const;

// Local storage key for overrides
const STORAGE_KEY = 'feature_flags_override';

/**
 * Get all feature flag overrides from localStorage
 */
const getLocalOverrides = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * Check if a feature flag is enabled
 */
export const isFeatureEnabled = (flagKey: keyof typeof FEATURE_FLAGS): boolean => {
  const flag = FEATURE_FLAGS[flagKey];
  if (!flag) {
    console.warn(`Unknown feature flag: ${flagKey}`);
    return false;
  }

  // 1. Check environment variable (VITE_FF_FLAG_KEY=true/false)
  const envKey = `VITE_FF_${flag.key.toUpperCase()}`;
  const envValue = import.meta.env[envKey];
  if (envValue !== undefined) {
    return envValue === 'true' || envValue === true;
  }

  // 2. Check localStorage override (for dev/testing)
  const overrides = getLocalOverrides();
  if (flag.key in overrides) {
    return overrides[flag.key];
  }

  // 3. Return default value
  return flag.defaultValue;
};

/**
 * Set a feature flag override (for dev/testing)
 */
export const setFeatureOverride = (flagKey: keyof typeof FEATURE_FLAGS, enabled: boolean): void => {
  const flag = FEATURE_FLAGS[flagKey];
  if (!flag) {
    console.warn(`Unknown feature flag: ${flagKey}`);
    return;
  }

  const overrides = getLocalOverrides();
  overrides[flag.key] = enabled;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    console.error('Failed to save feature flag override');
  }
};

/**
 * Clear a specific feature flag override
 */
export const clearFeatureOverride = (flagKey: keyof typeof FEATURE_FLAGS): void => {
  const flag = FEATURE_FLAGS[flagKey];
  if (!flag) return;

  const overrides = getLocalOverrides();
  delete overrides[flag.key];
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
  } catch {
    console.error('Failed to clear feature flag override');
  }
};

/**
 * Clear all feature flag overrides
 */
export const clearAllOverrides = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error('Failed to clear feature flag overrides');
  }
};

/**
 * Get all feature flags with their current status
 */
export const getAllFeatureFlags = (): Array<FeatureFlag & { enabled: boolean; hasOverride: boolean }> => {
  const overrides = getLocalOverrides();
  
  return Object.entries(FEATURE_FLAGS).map(([key, flag]) => ({
    ...flag,
    enabled: isFeatureEnabled(key as keyof typeof FEATURE_FLAGS),
    hasOverride: flag.key in overrides,
  }));
};

/**
 * Get feature flags by category
 */
export const getFeatureFlagsByCategory = (category: FeatureFlag['category']) => {
  return getAllFeatureFlags().filter(flag => flag.category === category);
};

/**
 * Hook-friendly version - use in components
 * Usage: if (useFeatureFlag('AI_WORKOUT_COMPANION')) { ... }
 */
export const useFeatureFlag = (flagKey: keyof typeof FEATURE_FLAGS): boolean => {
  return isFeatureEnabled(flagKey);
};
