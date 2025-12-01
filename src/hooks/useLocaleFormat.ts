/**
 * Hook for locale-aware formatting
 * 
 * Provides access to all formatting utilities with React integration
 */

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  formatNumber,
  formatPercent,
  formatCurrency,
  formatWeight,
  formatDistance,
  formatCalories,
  formatDuration,
  formatCompact,
  formatOrdinal,
  formatRelativeTime,
  getDecimalSeparator,
  getThousandsSeparator,
} from '@/lib/formatUtils';

export const useLocaleFormat = () => {
  const { i18n } = useTranslation();
  
  // Re-create formatters when language changes
  const locale = i18n.language;
  
  // Memoized formatters that depend on locale
  const formatters = useMemo(() => ({
    number: formatNumber,
    percent: formatPercent,
    currency: formatCurrency,
    weight: formatWeight,
    distance: formatDistance,
    calories: formatCalories,
    duration: formatDuration,
    compact: formatCompact,
    ordinal: formatOrdinal,
    relativeTime: formatRelativeTime,
    decimalSeparator: getDecimalSeparator(),
    thousandsSeparator: getThousandsSeparator(),
  }), [locale]); // eslint-disable-line react-hooks/exhaustive-deps
  
  /**
   * Format a date according to locale
   */
  const formatDate = useCallback((
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
  }, [locale]);
  
  /**
   * Format a time according to locale
   */
  const formatTime = useCallback((
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
    };
    
    return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
  }, [locale]);
  
  /**
   * Format date and time together
   */
  const formatDateTime = useCallback((
    date: Date | string | number,
    options?: Intl.DateTimeFormatOptions
  ): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    
    return new Intl.DateTimeFormat(locale, options || defaultOptions).format(dateObj);
  }, [locale]);
  
  /**
   * Get relative time string (e.g., "2 days ago")
   */
  const formatTimeAgo = useCallback((date: Date | string | number): string => {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date;
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSeconds < 60) {
      return formatRelativeTime(-diffSeconds, 'second');
    } else if (diffMinutes < 60) {
      return formatRelativeTime(-diffMinutes, 'minute');
    } else if (diffHours < 24) {
      return formatRelativeTime(-diffHours, 'hour');
    } else if (diffDays < 7) {
      return formatRelativeTime(-diffDays, 'day');
    } else if (diffWeeks < 4) {
      return formatRelativeTime(-diffWeeks, 'week');
    } else if (diffMonths < 12) {
      return formatRelativeTime(-diffMonths, 'month');
    } else {
      return formatRelativeTime(-diffYears, 'year');
    }
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    ...formatters,
    formatDate,
    formatTime,
    formatDateTime,
    formatTimeAgo,
    locale,
  };
};

export default useLocaleFormat;
