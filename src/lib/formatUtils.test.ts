import { describe, it, expect } from 'vitest';

// Format utility tests
describe('Format Utilities', () => {
  describe('Currency formatting', () => {
    it('should format USD currency correctly', () => {
      const formatCurrency = (amount: number, locale = 'en-US', currency = 'USD'): string => {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        }).format(amount);
      };
      
      expect(formatCurrency(10)).toBe('$10.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0.99)).toBe('$0.99');
    });

    it('should format different currencies', () => {
      const formatCurrency = (amount: number, locale: string, currency: string): string => {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
        }).format(amount);
      };
      
      expect(formatCurrency(10, 'de-DE', 'EUR')).toContain('€');
      expect(formatCurrency(10, 'ja-JP', 'JPY')).toContain('¥');
    });
  });

  describe('Number formatting', () => {
    it('should format large numbers with separators', () => {
      const formatNumber = (num: number, locale = 'en-US'): string => {
        return new Intl.NumberFormat(locale).format(num);
      };
      
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });

    it('should format decimals correctly', () => {
      const formatDecimal = (num: number, decimals = 2): string => {
        return num.toFixed(decimals);
      };
      
      expect(formatDecimal(3.14159, 2)).toBe('3.14');
      expect(formatDecimal(10, 1)).toBe('10.0');
    });
  });

  describe('Date formatting', () => {
    it('should format dates for different locales', () => {
      const date = new Date('2024-01-15');
      
      const formatDate = (d: Date, locale: string): string => {
        return d.toLocaleDateString(locale);
      };
      
      // US format: MM/DD/YYYY
      expect(formatDate(date, 'en-US')).toMatch(/1\/15\/2024|01\/15\/2024/);
    });
  });

  describe('Time duration formatting', () => {
    it('should format minutes to hours and minutes', () => {
      const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
      };
      
      expect(formatDuration(30)).toBe('30m');
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(150)).toBe('2h 30m');
    });
  });

  describe('File size formatting', () => {
    it('should format bytes to human readable sizes', () => {
      const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
      };
      
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(500)).toBe('500 B');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
    });
  });
});
