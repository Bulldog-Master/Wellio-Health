import { describe, it, expect, beforeAll } from 'vitest';
import {
  encryptDataV2,
  decryptDataV2,
  hashData,
  generateSecureToken,
  detectEncryptionVersion,
  ENCRYPTION_VERSION,
  needsEncryptionUpgrade,
  encryptJSON,
  decryptJSON,
} from './index';

// Mock crypto for Node.js environment
beforeAll(() => {
  if (typeof globalThis.crypto === 'undefined') {
    // Skip crypto tests in non-browser environment
  }
});

describe('Encryption Utilities', () => {
  describe('ENCRYPTION_VERSION constants', () => {
    it('should define correct version constants', () => {
      expect(ENCRYPTION_VERSION.LEGACY_AES_GCM).toBe(1);
      expect(ENCRYPTION_VERSION.ENHANCED_AES_256_GCM).toBe(2);
      expect(ENCRYPTION_VERSION.QUANTUM_RESISTANT).toBe(3);
    });
  });

  describe('needsEncryptionUpgrade', () => {
    it('should return true for null version', () => {
      expect(needsEncryptionUpgrade(null)).toBe(true);
    });

    it('should return true for undefined version', () => {
      expect(needsEncryptionUpgrade(undefined)).toBe(true);
    });

    it('should return true for legacy v1', () => {
      expect(needsEncryptionUpgrade(1)).toBe(true);
    });

    it('should return true for v2', () => {
      expect(needsEncryptionUpgrade(2)).toBe(true);
    });

    it('should return false for current version', () => {
      expect(needsEncryptionUpgrade(3)).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate token of correct length', () => {
      const token = generateSecureToken(16);
      expect(token.length).toBe(32); // 16 bytes = 32 hex chars
    });

    it('should generate unique tokens', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();
      expect(token1).not.toBe(token2);
    });

    it('should default to 32 bytes (64 hex chars)', () => {
      const token = generateSecureToken();
      expect(token.length).toBe(64);
    });
  });

  describe('encryptDataV2 and decryptDataV2', async () => {
    const testData = 'Hello, World!';
    const secret = 'test-secret-key-12345';

    it('should encrypt and decrypt data correctly', async () => {
      const encrypted = await encryptDataV2(testData, secret);
      expect(encrypted).not.toBe(testData);
      
      const decrypted = await decryptDataV2(encrypted, secret);
      expect(decrypted).toBe(testData);
    });

    it('should produce different ciphertext each time (due to random salt/IV)', async () => {
      const encrypted1 = await encryptDataV2(testData, secret);
      const encrypted2 = await encryptDataV2(testData, secret);
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should fail decryption with wrong secret', async () => {
      const encrypted = await encryptDataV2(testData, secret);
      await expect(decryptDataV2(encrypted, 'wrong-secret')).rejects.toThrow();
    });
  });

  describe('detectEncryptionVersion', () => {
    it('should detect v2 encrypted data', async () => {
      const encrypted = await encryptDataV2('test', 'secret');
      const version = detectEncryptionVersion(encrypted);
      expect(version).toBe(ENCRYPTION_VERSION.ENHANCED_AES_256_GCM);
    });

    it('should return v1 for invalid data', () => {
      const version = detectEncryptionVersion('invalid-base64!@#');
      expect(version).toBe(ENCRYPTION_VERSION.LEGACY_AES_GCM);
    });
  });

  describe('hashData', () => {
    it('should produce consistent hash for same input', async () => {
      const hash1 = await hashData('test');
      const hash2 = await hashData('test');
      expect(hash1).toBe(hash2);
    });

    it('should produce different hash for different input', async () => {
      const hash1 = await hashData('test1');
      const hash2 = await hashData('test2');
      expect(hash1).not.toBe(hash2);
    });

    it('should include salt in hash when provided', async () => {
      const hashNoSalt = await hashData('test');
      const hashWithSalt = await hashData('test', 'salt');
      expect(hashNoSalt).not.toBe(hashWithSalt);
    });
  });

  describe('encryptJSON and decryptJSON', () => {
    it('should encrypt and decrypt JSON objects', async () => {
      const data = { name: 'Test', value: 123 };
      const secret = 'json-secret';
      
      const encrypted = await encryptJSON(data, secret);
      expect(encrypted).not.toBe(JSON.stringify(data));
      
      const decrypted = await decryptJSON<typeof data>(encrypted, secret);
      expect(decrypted).toEqual(data);
    });

    it('should handle arrays', async () => {
      const data = [1, 2, 3, 'test'];
      const secret = 'array-secret';
      
      const encrypted = await encryptJSON(data, secret);
      const decrypted = await decryptJSON<typeof data>(encrypted, secret);
      expect(decrypted).toEqual(data);
    });
  });
});
