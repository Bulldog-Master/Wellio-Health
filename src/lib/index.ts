/**
 * Library Module Index
 * 
 * This file documents the organization of the lib/ directory.
 * Import from specific modules for best tree-shaking and code organization.
 * 
 * Directory Structure:
 * 
 * lib/
 * ├── encryption/     - Cryptographic utilities
 * │   ├── core.ts     - AES-256-GCM encryption (v2)
 * │   ├── quantum.ts  - ML-KEM + ML-DSA post-quantum (v3)
 * │   └── medical.ts  - Server-side medical encryption
 * │
 * ├── services/       - Application services
 * │   ├── analytics.ts        - Event tracking
 * │   ├── errorTracking.ts    - Error logging to database
 * │   ├── errorHandler.ts     - Error handling utilities
 * │   ├── monitoring.ts       - Unified monitoring
 * │   └── performanceMonitoring.ts - Web vitals
 * │
 * ├── utils/          - General utilities
 * │   ├── utils.ts          - Core utilities (cn)
 * │   ├── formatUtils.ts    - Locale-aware formatting
 * │   └── unitConversion.ts - Imperial/metric conversion
 * │
 * └── validation/     - Validation schemas
 *     └── validationSchemas.ts - Zod schemas
 * 
 * Usage Examples:
 * 
 * // Encryption
 * import { encryptJSON, decryptJSON } from '@/lib/encryption';
 * import { hybridEncrypt, hybridDecrypt } from '@/lib/encryption';
 * 
 * // Services
 * import { trackEvent, trackPageView } from '@/lib/services';
 * import { initMonitoring } from '@/lib/services';
 * 
 * // Utils
 * import { cn } from '@/lib/utils';
 * import { formatNumber, formatCurrency } from '@/lib/utils';
 * import { lbsToKg, formatWeight } from '@/lib/utils';
 * 
 * // Validation
 * import { emailSchema, passwordSchema } from '@/lib/validation';
 * 
 * Note: Legacy imports (e.g., '@/lib/encryption.ts') still work for
 * backward compatibility but are deprecated.
 */

// Re-export main modules for convenience
export * from './encryption';
export * as services from './services';
export * as utils from './utils';
export * as validation from './validation';
