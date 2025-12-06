/**
 * Quantum-Resistant Encryption Utilities
 * 
 * ENCRYPTION VERSIONS:
 * - v1: Legacy AES-GCM (deprecated)
 * - v2: Enhanced AES-256-GCM with PBKDF2 key derivation
 * - v3: NIST Post-Quantum: ML-KEM-768 (CRYSTALS-Kyber) + AES-256-GCM hybrid (current)
 * 
 * Medical records and sensitive data use encryption_version column to track algorithm.
 * 
 * For quantum-resistant operations, use:
 * - Client-side: src/lib/quantumEncryption.ts (ML-KEM + ML-DSA)
 * - Hook: src/hooks/useQuantumEncryption.ts
 */

// Note: For quantum-resistant operations, import directly from:
// - src/lib/quantumEncryption.ts (ML-KEM + ML-DSA)
// - src/hooks/useQuantumEncryption.ts (React hook)

// Encryption version constants
export const ENCRYPTION_VERSION = {
  LEGACY_AES_GCM: 1,
  ENHANCED_AES_256_GCM: 2,
  QUANTUM_RESISTANT: 3, // ML-KEM-768 + AES-256-GCM hybrid
} as const;

// Set current version to quantum-resistant
export const CURRENT_ENCRYPTION_VERSION = ENCRYPTION_VERSION.QUANTUM_RESISTANT;

// Generate a random encryption key (256-bit)
export const generateEncryptionKey = async (): Promise<string> => {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

// Generate a random salt for key derivation
const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16));
};

// Derive encryption key from password/secret using PBKDF2
const deriveKey = async (
  secret: string, 
  salt: Uint8Array,
  iterations: number = 100000
): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // Create a proper ArrayBuffer copy to avoid SharedArrayBuffer issues
  const saltBuffer = new ArrayBuffer(salt.length);
  const saltView = new Uint8Array(saltBuffer);
  saltView.set(salt);

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Import key from base64 string (for legacy compatibility)
const importKey = async (keyBase64: string): Promise<CryptoKey> => {
  const keyData = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

/**
 * Enhanced encryption using AES-256-GCM with PBKDF2 key derivation
 * Format: version(1) + salt(16) + iv(12) + ciphertext
 * Returns base64 encoded string
 */
export const encryptDataV2 = async (data: string, secret: string): Promise<string> => {
  const salt = generateSalt();
  const key = await deriveKey(secret, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );
  
  // Combine version + salt + IV + encrypted data
  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(1 + salt.length + iv.length + encryptedArray.length);
  combined[0] = ENCRYPTION_VERSION.ENHANCED_AES_256_GCM; // Use V2 for symmetric encryption
  combined.set(salt, 1);
  combined.set(iv, 1 + salt.length);
  combined.set(encryptedArray, 1 + salt.length + iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

/**
 * Decrypt data encrypted with encryptDataV2
 */
export const decryptDataV2 = async (encryptedBase64: string, secret: string): Promise<string> => {
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  const version = combined[0];
  
  if (version === ENCRYPTION_VERSION.ENHANCED_AES_256_GCM) {
    // V2 format: version(1) + salt(16) + iv(12) + ciphertext
    const salt = combined.slice(1, 17);
    const iv = combined.slice(17, 29);
    const encryptedData = combined.slice(29);
    
    const key = await deriveKey(secret, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );
    
    return new TextDecoder().decode(decrypted);
  } else if (version === ENCRYPTION_VERSION.LEGACY_AES_GCM || !version) {
    // Legacy V1 format fallback: iv(12) + ciphertext
    throw new Error('Legacy encryption detected. Please re-encrypt with current version.');
  } else {
    throw new Error(`Unknown encryption version: ${version}`);
  }
};

/**
 * Legacy encryption using AES-GCM (deprecated - use encryptDataV2)
 * Kept for backward compatibility during migration
 */
export const encryptData = async (data: string, keyBase64: string): Promise<string> => {
  const key = await importKey(keyBase64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  
  return btoa(String.fromCharCode(...combined));
};

/**
 * Legacy decryption (deprecated - use decryptDataV2)
 */
export const decryptData = async (encryptedBase64: string, keyBase64: string): Promise<string> => {
  const key = await importKey(keyBase64);
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  // Check if this might be V2 format
  if (combined[0] === ENCRYPTION_VERSION.ENHANCED_AES_256_GCM) {
    throw new Error('V2 encryption detected. Use decryptDataV2 instead.');
  }
  
  // Extract IV (first 12 bytes) and encrypted data
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );
  
  return new TextDecoder().decode(decrypted);
};

/**
 * Detect encryption version from encrypted data
 */
export const detectEncryptionVersion = (encryptedBase64: string): number => {
  try {
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const firstByte = combined[0];
    
    // V2+ have version byte in range 1-255
    if (firstByte >= 1 && firstByte <= 10) {
      return firstByte;
    }
    
    // Legacy V1 has IV starting with random bytes
    return ENCRYPTION_VERSION.LEGACY_AES_GCM;
  } catch {
    return ENCRYPTION_VERSION.LEGACY_AES_GCM;
  }
};

/**
 * Hash sensitive data for comparison (one-way)
 * Uses SHA-256 with salt for added security
 */
export const hashData = async (data: string, salt?: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataToHash = salt ? `${salt}:${data}` : data;
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(dataToHash));
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
};

/**
 * Encrypt JSON data (for 2FA backup codes, etc.)
 */
export const encryptJSON = async <T>(data: T, secret: string): Promise<string> => {
  return encryptDataV2(JSON.stringify(data), secret);
};

/**
 * Decrypt JSON data
 */
export const decryptJSON = async <T>(encryptedBase64: string, secret: string): Promise<T> => {
  const decrypted = await decryptDataV2(encryptedBase64, secret);
  return JSON.parse(decrypted) as T;
};

/**
 * Check if data needs encryption upgrade
 */
export const needsEncryptionUpgrade = (version: number | null | undefined): boolean => {
  return !version || version < CURRENT_ENCRYPTION_VERSION;
};

/**
 * Generate secure random token (for session IDs, etc.)
 */
export const generateSecureToken = (length: number = 32): string => {
  const array = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};
