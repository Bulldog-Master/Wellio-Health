/**
 * Encryption Module - Barrel Export
 * 
 * Organized encryption utilities:
 * - core: AES-256-GCM encryption (v2)
 * - quantum: ML-KEM + ML-DSA post-quantum (v3)
 * - medical: Server-side medical data encryption
 * 
 * Usage:
 * import { encryptJSON, decryptJSON } from '@/lib/encryption';
 * import { hybridEncrypt, hybridDecrypt } from '@/lib/encryption';
 * import { encryptMedicalData } from '@/lib/encryption';
 */

// Core AES-256-GCM encryption (v2)
export {
  ENCRYPTION_VERSION,
  CURRENT_ENCRYPTION_VERSION,
  generateEncryptionKey,
  encryptData,
  decryptData,
  encryptDataV2,
  decryptDataV2,
  encryptJSON,
  decryptJSON,
  detectEncryptionVersion,
  hashData,
  needsEncryptionUpgrade,
  generateSecureToken,
} from './core';

// Quantum-resistant encryption (ML-KEM + ML-DSA) - v3
export {
  QUANTUM_ENCRYPTION_VERSION,
  generateMlKemKeyPair,
  encapsulateKey,
  decapsulateKey,
  generateMlDsaKeyPair,
  signData,
  verifySignature,
  hybridEncrypt,
  hybridDecrypt,
  signAndEncrypt,
  verifyAndDecrypt,
  generateUserKeySet,
  isQuantumEncrypted,
  uint8ArrayToBase64,
  base64ToUint8Array,
  serializeKeyPair,
  deserializeKeyPair,
  type MlKemKeyPair,
  type MlDsaKeyPair,
  type EncapsulatedKey,
  type SignedData,
} from './quantum';

// Medical data encryption (server-side via edge function)
export {
  ENCRYPTION_VERSION as MEDICAL_ENCRYPTION_VERSION,
  encryptMedicalData,
  decryptMedicalData,
  needsEncryptionMigration,
  migrateEncryption,
  type EncryptResult,
  type DecryptResult,
} from './medical';
