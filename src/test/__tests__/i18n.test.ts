import { describe, it, expect } from 'vitest';

/**
 * Internationalization Tests
 */
describe('Internationalization', () => {
  describe('Locale Detection', () => {
    const detectLocale = (navigatorLanguage: string): string => {
      const supported = ['en', 'es', 'pt', 'fr', 'de', 'zh', 'tr', 'it', 'nl', 'ru', 'ja', 'ko', 'ar', 'hi', 'bn', 'id', 'pcm', 'ta', 'ur', 'arz', 'mr', 'te', 'vi'];
      const primary = navigatorLanguage.split('-')[0].toLowerCase();
      
      if (supported.includes(primary)) return primary;
      return 'en';
    };

    it('should detect supported language', () => {
      expect(detectLocale('es-MX')).toBe('es');
      expect(detectLocale('pt-BR')).toBe('pt');
      expect(detectLocale('zh-CN')).toBe('zh');
    });

    it('should fallback to English for unsupported languages', () => {
      expect(detectLocale('sw')).toBe('en');
      expect(detectLocale('unknown')).toBe('en');
    });
  });

  describe('Number Formatting', () => {
    const formatNumber = (value: number, locale: string): string => {
      return new Intl.NumberFormat(locale).format(value);
    };

    it('should format numbers per locale', () => {
      expect(formatNumber(1234.56, 'en-US')).toBe('1,234.56');
      expect(formatNumber(1234.56, 'de-DE')).toBe('1.234,56');
      expect(formatNumber(1234.56, 'fr-FR')).toMatch(/1\s?234,56/);
    });
  });

  describe('Date Formatting', () => {
    const formatDate = (date: Date, locale: string): string => {
      return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    };

    it('should format dates per locale', () => {
      const date = new Date('2024-03-15');
      
      const enDate = formatDate(date, 'en-US');
      expect(enDate).toContain('Mar');
      expect(enDate).toContain('15');
      expect(enDate).toContain('2024');
    });
  });

  describe('Currency Formatting', () => {
    const formatCurrency = (amount: number, locale: string, currency: string): string => {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(amount);
    };

    it('should format USD correctly', () => {
      const formatted = formatCurrency(29.99, 'en-US', 'USD');
      expect(formatted).toContain('$');
      expect(formatted).toContain('29.99');
    });

    it('should format EUR correctly', () => {
      const formatted = formatCurrency(29.99, 'de-DE', 'EUR');
      expect(formatted).toContain('€');
    });
  });

  describe('Pluralization', () => {
    const pluralize = (count: number, singular: string, plural: string): string => {
      return count === 1 ? singular : plural;
    };

    it('should return singular for 1', () => {
      expect(pluralize(1, 'item', 'items')).toBe('item');
    });

    it('should return plural for 0 and >1', () => {
      expect(pluralize(0, 'item', 'items')).toBe('items');
      expect(pluralize(5, 'item', 'items')).toBe('items');
    });
  });

  describe('RTL Support', () => {
    const isRTL = (locale: string): boolean => {
      const rtlLocales = ['ar', 'he', 'fa', 'ur', 'arz'];
      return rtlLocales.includes(locale);
    };

    it('should detect RTL languages', () => {
      expect(isRTL('ar')).toBe(true);
      expect(isRTL('ur')).toBe(true);
      expect(isRTL('arz')).toBe(true);
    });

    it('should detect LTR languages', () => {
      expect(isRTL('en')).toBe(false);
      expect(isRTL('es')).toBe(false);
      expect(isRTL('zh')).toBe(false);
    });
  });
});
