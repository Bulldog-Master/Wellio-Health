/**
 * Library Module Index
 * 
 * Import from specific modules for best tree-shaking and code organization.
 * 
 * Directory Structure:
 * lib/
 * ├── auth/           - Authentication utilities
 * ├── encryption/     - Cryptographic utilities  
 * ├── features/       - Feature management
 * ├── location/       - Location utilities
 * ├── media/          - Media handling
 * ├── services/       - Application services
 * ├── storage/        - Storage utilities
 * ├── testing/        - Testing utilities
 * ├── utils/          - General utilities
 * └── validation/     - Validation schemas
 * 
 * Usage: Import from specific submodules for better tree-shaking:
 * import { cn } from '@/lib/utils';
 * import { encryptJSON } from '@/lib/encryption';
 */

// Re-export modules
export * from './auth';
export * from './features';
export * from './location';
export * from './media';
export * from './services';
export * from './storage';
export * from './utils';
export * from './validation';

// For encryption, import directly: import { ... } from '@/lib/encryption'
// to access all encryption utilities including quantum-resistant ones
