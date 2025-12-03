/**
 * Application-layer encryption utilities for sensitive data
 * Uses Web Crypto API for AES-GCM encryption
 */

// Generate a random encryption key (store securely - e.g., in Supabase secrets for edge functions)
export const generateEncryptionKey = async (): Promise<string> => {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await crypto.subtle.exportKey('raw', key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

// Import key from base64 string
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
 * Encrypt sensitive data using AES-GCM
 * Returns base64 encoded string with IV prepended
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
 * Decrypt data encrypted with encryptData
 */
export const decryptData = async (encryptedBase64: string, keyBase64: string): Promise<string> => {
  const key = await importKey(keyBase64);
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
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
 * Hash sensitive data for comparison (one-way)
 * Useful for searching encrypted data without decrypting
 */
export const hashData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
};
