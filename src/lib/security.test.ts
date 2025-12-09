import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Security Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should validate strong passwords', () => {
    const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
      const errors: string[] = [];
      
      if (password.length < 8) errors.push('Password must be at least 8 characters');
      if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
      if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
      if (!/[0-9]/.test(password)) errors.push('Password must contain number');
      if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character');
      
      return { valid: errors.length === 0, errors };
    };
    
    // Weak password
    const weak = validatePassword('password');
    expect(weak.valid).toBe(false);
    
    // Strong password
    const strong = validatePassword('StrongP@ss1');
    expect(strong.valid).toBe(true);
  });

  it('should sanitize user input', () => {
    const sanitize = (input: string): string => {
      return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    };
    
    const malicious = '<script>alert("xss")</script>';
    const sanitized = sanitize(malicious);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('&lt;script&gt;');
  });

  it('should validate email format', () => {
    const validateEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };
    
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('invalid-email')).toBe(false);
    expect(validateEmail('@missing-local.com')).toBe(false);
  });

  it('should detect potentially malicious URLs', () => {
    const isSafeUrl = (url: string): boolean => {
      try {
        const parsed = new URL(url);
        const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
        return !dangerousProtocols.includes(parsed.protocol);
      } catch {
        return false;
      }
    };
    
    expect(isSafeUrl('https://example.com')).toBe(true);
    expect(isSafeUrl('http://example.com')).toBe(true);
    expect(isSafeUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeUrl('not-a-url')).toBe(false);
  });
});
