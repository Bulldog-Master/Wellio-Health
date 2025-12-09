// Test utilities barrel export
// Centralized test utilities and helpers

// Test utilities and configuration
export * from './testUtils';

// Test suites are in __tests__/ directory:
// - auth.test.ts - Authentication flows (email, password, session, 2FA)
// - subscription.test.ts - Subscription/premium feature access
// - fitness.test.ts - Workout, weight, steps, habits
// - i18n.test.ts - Internationalization (23 languages)
// - encryption.test.ts - Security utilities
// - security.test.ts - Input validation, XSS prevention
