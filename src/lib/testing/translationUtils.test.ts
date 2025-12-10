import { describe, it, expect } from 'vitest';

describe('Translation Utilities', () => {
  it('should format numbers with locale', () => {
    const num = 1234567.89;
    
    // English format
    const enFormatted = new Intl.NumberFormat('en-US').format(num);
    expect(enFormatted).toBe('1,234,567.89');
    
    // German format
    const deFormatted = new Intl.NumberFormat('de-DE').format(num);
    expect(deFormatted).toMatch(/1\.234\.567,89/);
    
    // Spanish format
    const esFormatted = new Intl.NumberFormat('es-ES').format(num);
    expect(esFormatted).toMatch(/1\.234\.567,89/);
  });

  it('should format currency with locale', () => {
    const amount = 99.99;
    
    // USD
    const usd = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
    expect(usd).toBe('$99.99');
    
    // EUR
    const eur = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
    expect(eur).toMatch(/99,99\s*€/);
  });

  it('should format dates with locale', () => {
    const date = new Date('2025-01-15');
    
    // English format
    const enDate = new Intl.DateTimeFormat('en-US').format(date);
    expect(enDate).toBe('1/15/2025');
    
    // German format
    const deDate = new Intl.DateTimeFormat('de-DE').format(date);
    expect(deDate).toBe('15.1.2025');
  });

  it('should handle pluralization', () => {
    const getPluralForm = (count: number, singular: string, plural: string) => {
      return count === 1 ? singular : plural;
    };
    
    expect(getPluralForm(1, 'item', 'items')).toBe('item');
    expect(getPluralForm(0, 'item', 'items')).toBe('items');
    expect(getPluralForm(5, 'item', 'items')).toBe('items');
  });
});
