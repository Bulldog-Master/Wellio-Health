/**
 * Locale-aware formatting utilities
 * 
 * Provides consistent number, currency, and unit formatting
 * that respects the user's language preferences.
 */

import i18n from 'i18next';

// Locale mapping for Intl API
const getLocale = (): string => {
  const lang = i18n.language || 'en';
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    de: 'de-DE',
    fr: 'fr-FR',
    pt: 'pt-BR',
    zh: 'zh-CN',
  };
  return localeMap[lang] || localeMap[lang.split('-')[0]] || 'en-US';
};

/**
 * Format a number with locale-aware separators
 * @example formatNumber(1234.56) => "1,234.56" (en) or "1.234,56" (es)
 */
export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat(getLocale(), options).format(value);
};

/**
 * Format a percentage
 * @example formatPercent(0.75) => "75%" (en) or "75 %" (fr)
 */
export const formatPercent = (
  value: number,
  decimals = 0
): string => {
  return new Intl.NumberFormat(getLocale(), {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format currency
 * @example formatCurrency(29.99, 'USD') => "$29.99" (en) or "29,99 $" (es)
 */
export const formatCurrency = (
  value: number,
  currency = 'USD'
): string => {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format weight with appropriate unit
 * @example formatWeight(150, 'lbs') => "150 lbs" or "150 libras" (es)
 */
export const formatWeight = (
  value: number,
  unit: 'lbs' | 'kg' = 'lbs'
): string => {
  const formattedValue = formatNumber(value, { maximumFractionDigits: 1 });
  // Unit labels should come from translations
  const unitLabel = i18n.t(`units.${unit}`, { defaultValue: unit });
  return `${formattedValue} ${unitLabel}`;
};

/**
 * Format distance with appropriate unit
 * @example formatDistance(5.5, 'miles') => "5.5 miles" or "5,5 millas" (es)
 */
export const formatDistance = (
  value: number,
  unit: 'miles' | 'km' | 'meters' = 'miles'
): string => {
  const formattedValue = formatNumber(value, { maximumFractionDigits: 2 });
  const unitLabel = i18n.t(`units.${unit}`, { defaultValue: unit });
  return `${formattedValue} ${unitLabel}`;
};

/**
 * Format calories
 * @example formatCalories(2500) => "2,500 cal" or "2.500 cal" (es)
 */
export const formatCalories = (value: number): string => {
  const formattedValue = formatNumber(value, { maximumFractionDigits: 0 });
  const unitLabel = i18n.t('units.calories', { defaultValue: 'cal' });
  return `${formattedValue} ${unitLabel}`;
};

/**
 * Format duration in a human-readable way
 * @example formatDuration(90) => "1h 30m" or "1h 30min" (es)
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  const hourLabel = i18n.t('units.hour_short', { defaultValue: 'h' });
  const minLabel = i18n.t('units.minute_short', { defaultValue: 'm' });
  
  if (hours === 0) {
    return `${mins}${minLabel}`;
  }
  if (mins === 0) {
    return `${hours}${hourLabel}`;
  }
  return `${hours}${hourLabel} ${mins}${minLabel}`;
};

/**
 * Format a compact number (1K, 1M, etc.)
 * @example formatCompact(1500) => "1.5K" (en) or "1,5 mil" (es)
 */
export const formatCompact = (value: number): string => {
  return new Intl.NumberFormat(getLocale(), {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
};

/**
 * Format ordinal numbers
 * @example formatOrdinal(1) => "1st" (en) or "1º" (es)
 */
export const formatOrdinal = (value: number): string => {
  const lang = i18n.language || 'en';
  
  // Spanish uses superscript º/ª
  if (lang.startsWith('es')) {
    return `${value}º`;
  }
  
  // French uses e/er
  if (lang.startsWith('fr')) {
    return value === 1 ? `${value}er` : `${value}e`;
  }
  
  // German uses .
  if (lang.startsWith('de')) {
    return `${value}.`;
  }
  
  // English ordinals
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = value % 100;
  const suffix = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
  return `${value}${suffix}`;
};

/**
 * Format relative time (e.g., "2 days ago")
 * Uses Intl.RelativeTimeFormat for locale support
 */
export const formatRelativeTime = (
  value: number,
  unit: Intl.RelativeTimeFormatUnit
): string => {
  return new Intl.RelativeTimeFormat(getLocale(), {
    numeric: 'auto',
  }).format(value, unit);
};

/**
 * Get the appropriate decimal separator for current locale
 */
export const getDecimalSeparator = (): string => {
  return (1.1).toLocaleString(getLocale()).substring(1, 2);
};

/**
 * Get the appropriate thousands separator for current locale
 */
export const getThousandsSeparator = (): string => {
  return (1000).toLocaleString(getLocale()).substring(1, 2);
};
