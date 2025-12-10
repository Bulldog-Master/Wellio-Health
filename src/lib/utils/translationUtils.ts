/**
 * Translation Utilities
 * 
 * Tools for maintaining translation parity across languages.
 * Use these during development to catch missing translations early.
 */

// Track missing keys during runtime
const missingKeys: Map<string, Set<string>> = new Map();

/**
 * Log missing translation key (called by i18n missing key handler)
 */
export const logMissingKey = (lng: string, ns: string, key: string) => {
  const fullKey = `${ns}:${key}`;
  
  if (!missingKeys.has(lng)) {
    missingKeys.set(lng, new Set());
  }
  
  missingKeys.get(lng)?.add(fullKey);
  
  // Only log in development
  if (import.meta.env.DEV) {
    console.warn(`⚠️ MISSING TRANSLATION: [${lng}] ${fullKey}`);
  }
};

/**
 * Get all missing keys collected during session
 */
export const getMissingKeys = (): Record<string, string[]> => {
  const result: Record<string, string[]> = {};
  
  missingKeys.forEach((keys, lng) => {
    result[lng] = Array.from(keys);
  });
  
  return result;
};

/**
 * Clear collected missing keys
 */
export const clearMissingKeys = () => {
  missingKeys.clear();
};

/**
 * Compare two translation objects and find missing keys
 */
export const compareTranslations = (
  source: Record<string, any>,
  target: Record<string, any>,
  sourceLang: string,
  targetLang: string
): { missingInTarget: string[]; missingInSource: string[]; } => {
  const getKeys = (obj: Record<string, any>, prefix = ''): string[] => {
    const keys: string[] = [];
    
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys.push(...getKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    
    return keys;
  };
  
  const sourceKeys = new Set(getKeys(source));
  const targetKeys = new Set(getKeys(target));
  
  const missingInTarget = Array.from(sourceKeys).filter(k => !targetKeys.has(k));
  const missingInSource = Array.from(targetKeys).filter(k => !sourceKeys.has(k));
  
  if (import.meta.env.DEV && (missingInTarget.length > 0 || missingInSource.length > 0)) {
    if (missingInTarget.length > 0) {
      console.warn(`🌐 Keys in ${sourceLang} but missing in ${targetLang}:`, missingInTarget);
    }
    if (missingInSource.length > 0) {
      console.warn(`🌐 Keys in ${targetLang} but missing in ${sourceLang}:`, missingInSource);
    }
  }
  
  return { missingInTarget, missingInSource };
};

/**
 * Validate all namespaces between two languages
 * Call this during app initialization in development
 */
export const validateTranslations = (
  resources: Record<string, Record<string, any>>,
  sourceLang = 'en',
  targetLang = 'es'
) => {
  if (!import.meta.env.DEV) return;
  
  const sourceResources = resources[sourceLang];
  const targetResources = resources[targetLang];
  
  if (!sourceResources || !targetResources) {
    console.warn(`🌐 Cannot validate: missing ${sourceLang} or ${targetLang} resources`);
    return;
  }
  
  const allMissing: { namespace: string; missingInTarget: string[]; missingInSource: string[] }[] = [];
  
  // Check all namespaces in source
  for (const namespace in sourceResources) {
    if (!targetResources[namespace]) {
      console.warn(`🌐 Namespace "${namespace}" exists in ${sourceLang} but not in ${targetLang}`);
      continue;
    }
    
    const { missingInTarget, missingInSource } = compareTranslations(
      sourceResources[namespace],
      targetResources[namespace],
      sourceLang,
      targetLang
    );
    
    if (missingInTarget.length > 0 || missingInSource.length > 0) {
      allMissing.push({ namespace, missingInTarget, missingInSource });
    }
  }
  
  // Check for namespaces only in target
  for (const namespace in targetResources) {
    if (!sourceResources[namespace]) {
      console.warn(`🌐 Namespace "${namespace}" exists in ${targetLang} but not in ${sourceLang}`);
    }
  }
  
  // Summary
  if (allMissing.length > 0) {
    console.group('🌐 Translation Parity Report');
    console.log(`Comparing ${sourceLang} → ${targetLang}`);
    
    let totalMissing = 0;
    allMissing.forEach(({ namespace, missingInTarget, missingInSource }) => {
      if (missingInTarget.length > 0) {
        console.warn(`  [${namespace}] Missing in ${targetLang}:`, missingInTarget);
        totalMissing += missingInTarget.length;
      }
      if (missingInSource.length > 0) {
        console.info(`  [${namespace}] Extra in ${targetLang}:`, missingInSource);
      }
    });
    
    console.log(`Total keys missing in ${targetLang}: ${totalMissing}`);
    console.groupEnd();
  } else {
    console.log(`✅ Translation parity OK: ${sourceLang} ↔ ${targetLang}`);
  }
};

/**
 * Generate a translation template from source language
 * Useful when adding a new language
 */
export const generateTranslationTemplate = (
  sourceObj: Record<string, any>,
  placeholder = '[TRANSLATE]'
): Record<string, any> => {
  const result: Record<string, any> = {};
  
  for (const key in sourceObj) {
    if (typeof sourceObj[key] === 'object' && sourceObj[key] !== null) {
      result[key] = generateTranslationTemplate(sourceObj[key], placeholder);
    } else {
      result[key] = `${placeholder}: ${sourceObj[key]}`;
    }
  }
  
  return result;
};
