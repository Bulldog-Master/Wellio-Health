/**
 * Hook for handling pluralization in translations
 * 
 * Usage:
 * const { plural } = usePlural();
 * plural('workout', count); // Returns "1 workout" or "5 workouts"
 * plural('follower', count); // Returns "1 seguidor" or "5 seguidores" (Spanish)
 */

import { useTranslation } from 'react-i18next';

export const usePlural = () => {
  const { t, i18n } = useTranslation('plurals');
  
  /**
   * Returns a pluralized string based on count
   * @param key - The base key (e.g., 'workout', 'follower')
   * @param count - The number to determine plural form
   * @param showCount - Whether to include the number (default: true)
   */
  const plural = (key: string, count: number, showCount = true): string => {
    if (showCount) {
      // Use the _count variant which includes the number
      const pluralKey = count === 1 ? `${key}_count` : `${key}_count_plural`;
      return t(pluralKey, { count });
    } else {
      // Just return the word without the number
      const pluralKey = count === 1 ? key : `${key}_plural`;
      return t(pluralKey);
    }
  };
  
  /**
   * Returns just the plural/singular word without count
   * @param key - The base key (e.g., 'workout', 'follower')
   * @param count - The number to determine plural form
   */
  const word = (key: string, count: number): string => {
    const pluralKey = count === 1 ? key : `${key}_plural`;
    return t(pluralKey);
  };
  
  /**
   * Check if current language uses complex pluralization
   * (Some languages like Chinese don't differentiate singular/plural)
   */
  const hasComplexPlurals = (): boolean => {
    const lang = i18n.language;
    // Languages with no plural forms
    const noPluralLanguages = ['zh', 'ja', 'ko', 'vi', 'th'];
    return !noPluralLanguages.some(l => lang.startsWith(l));
  };
  
  return { plural, word, hasComplexPlurals };
};

export default usePlural;
