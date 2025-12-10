/**
 * Quantum-Resistant Encryption using NIST FIPS 203/204 Standards
 * 
 * Implements:
 * - ML-KEM (CRYSTALS-Kyber) for key encapsulation (FIPS 203)
 * - ML-DSA (CRYSTALS-Dilithium) for digital signatures (FIPS 204)
 * 
 * This provides post-quantum security for medical records and sensitive data.
 */

// @ts-ignore - Noble library uses .js exports
import { ml_kem768 } from '@noble/post-quantum/ml-kem.js';
// @ts-ignore - Noble library uses .js exports
import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';

// Encryption version for quantum-resistant implementation
export const QUANTUM_ENCRYPTION_VERSION = 3;

/**
 * ML-KEM Key Pair for key encapsulation
 */
export interface MlKemKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

/**
 * ML-DSA Key Pair for digital signatures  
 */
export interface MlDsaKeyPair {
  publicKey: Uint8Array;
  secretKey: Uint8Array;
}

/**
 * Encapsulated key result
 */
export interface EncapsulatedKey {
  ciphertext: Uint8Array;
  sharedSecret: Uint8Array;
}

/**
 * Signed data result
 */
export interface SignedData {
  data: Uint8Array;
  signature: Uint8Array;
}

/**
 * Generate ML-KEM key pair for key encapsulation
 * Uses ML-KEM-768 (NIST Security Level 3)
 */
export function generateMlKemKeyPair(): MlKemKeyPair {
  const { publicKey, secretKey } = ml_kem768.keygen();
  return { publicKey, secretKey };
}

/**
 * Generate ML-DSA key pair for digital signatures
 * Uses ML-DSA-65 (NIST Security Level 3)
 */
export function generateMlDsaKeyPair(): MlDsaKeyPair {
  const { publicKey, secretKey } = ml_dsa65.keygen();
  return { publicKey, secretKey };
}

/**
 * Encapsulate a shared secret using recipient's public key
 * @param recipientPublicKey The recipient's ML-KEM public key
 * @returns Ciphertext and shared secret
 */
export function encapsulateKey(recipientPublicKey: Uint8Array): EncapsulatedKey {
  const { cipherText: ciphertext, sharedSecret } = ml_kem768.encapsulate(recipientPublicKey);
  return { ciphertext, sharedSecret };
}

/**
 * Decapsulate to recover shared secret
 * @param ciphertext The ciphertext from encapsulation
 * @param secretKey The recipient's secret key
 * @returns The shared secret
 */
export function decapsulateKey(ciphertext: Uint8Array, secretKey: Uint8Array): Uint8Array {
  return ml_kem768.decapsulate(ciphertext, secretKey);
}

/**
 * Sign data with ML-DSA
 * @param data The data to sign
 * @param secretKey The signer's secret key
 * @returns The signature
 */
export function signData(data: Uint8Array, secretKey: Uint8Array): Uint8Array {
  return ml_dsa65.sign(secretKey, data);
}

/**
 * Verify ML-DSA signature
 * @param data The signed data
 * @param signature The signature to verify
 * @param publicKey The signer's public key
 * @returns True if signature is valid
 */
export function verifySignature(
  data: Uint8Array,
  signature: Uint8Array,
  publicKey: Uint8Array
): boolean {
  return ml_dsa65.verify(publicKey, data, signature);
}

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr));
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

/**
 * Serialize key pair for storage
 */
export function serializeKeyPair(keyPair: MlKemKeyPair | MlDsaKeyPair): {
  publicKey: string;
  secretKey: string;
} {
  return {
    publicKey: uint8ArrayToBase64(keyPair.publicKey),
    secretKey: uint8ArrayToBase64(keyPair.secretKey),
  };
}

/**
 * Deserialize key pair from storage
 */
export function deserializeKeyPair(serialized: { publicKey: string; secretKey: string }): MlKemKeyPair {
  return {
    publicKey: base64ToUint8Array(serialized.publicKey),
    secretKey: base64ToUint8Array(serialized.secretKey),
  };
}

/**
 * Hybrid encryption: Uses ML-KEM for key exchange + AES-256-GCM for data encryption
 * This provides both quantum resistance and efficient data encryption
 * 
 * Format: version(1) + kemCiphertext + iv(12) + aesCiphertext
 */
export async function hybridEncrypt(
  data: string,
  recipientPublicKey: Uint8Array
): Promise<string> {
  // Encapsulate to get shared secret
  const { ciphertext: kemCiphertext, sharedSecret } = encapsulateKey(recipientPublicKey);
  
  // Use shared secret as AES key material
  const aesKey = await crypto.subtle.importKey(
    'raw',
    sharedSecret.slice(0, 32), // Use first 32 bytes for AES-256
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  
  // Generate IV for AES-GCM
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt data with AES-GCM
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encoder.encode(data)
  );
  
  // Combine: version(1) + kemCiphertext + iv(12) + encrypted
  const encryptedArray = new Uint8Array(encrypted);
  const combined = new Uint8Array(
    1 + kemCiphertext.length + iv.length + encryptedArray.length
  );
  
  let offset = 0;
  combined[offset] = QUANTUM_ENCRYPTION_VERSION;
  offset += 1;
  combined.set(kemCiphertext, offset);
  offset += kemCiphertext.length;
  combined.set(iv, offset);
  offset += iv.length;
  combined.set(encryptedArray, offset);
  
  return uint8ArrayToBase64(combined);
}

/**
 * Hybrid decryption: Uses ML-KEM for key exchange + AES-256-GCM for data decryption
 */
export async function hybridDecrypt(
  encryptedBase64: string,
  secretKey: Uint8Array
): Promise<string> {
  const combined = base64ToUint8Array(encryptedBase64);
  
  const version = combined[0];
  if (version !== QUANTUM_ENCRYPTION_VERSION) {
    throw new Error(`Unsupported encryption version: ${version}. Expected ${QUANTUM_ENCRYPTION_VERSION}`);
  }
  
  // ML-KEM-768 ciphertext is 1088 bytes
  const kemCiphertextLength = 1088;
  
  let offset = 1;
  const kemCiphertext = combined.slice(offset, offset + kemCiphertextLength);
  offset += kemCiphertextLength;
  const iv = combined.slice(offset, offset + 12);
  offset += 12;
  const encryptedData = combined.slice(offset);
  
  // Decapsulate to recover shared secret
  const sharedSecret = decapsulateKey(kemCiphertext, secretKey);
  
  // Use shared secret as AES key material
  const aesKey = await crypto.subtle.importKey(
    'raw',
    sharedSecret.slice(0, 32),
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  
  // Decrypt data with AES-GCM
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    encryptedData
  );
  
  return new TextDecoder().decode(decrypted);
}

/**
 * Sign and encrypt data for authenticated encryption
 * Provides both confidentiality (ML-KEM) and authenticity (ML-DSA)
 */
export async function signAndEncrypt(
  data: string,
  senderSigningKey: Uint8Array,
  recipientEncryptionKey: Uint8Array
): Promise<{ encrypted: string; signature: string }> {
  // First encrypt the data
  const encrypted = await hybridEncrypt(data, recipientEncryptionKey);
  
  // Sign the encrypted data
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(encrypted);
  const signature = signData(dataBytes, senderSigningKey);
  
  return {
    encrypted,
    signature: uint8ArrayToBase64(signature),
  };
}

/**
 * Verify signature and decrypt data
 */
export async function verifyAndDecrypt(
  encrypted: string,
  signature: string,
  senderVerifyKey: Uint8Array,
  recipientDecryptionKey: Uint8Array
): Promise<string> {
  // Verify signature first
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(encrypted);
  const signatureBytes = base64ToUint8Array(signature);
  
  const isValid = verifySignature(dataBytes, signatureBytes, senderVerifyKey);
  if (!isValid) {
    throw new Error('Invalid signature - data may have been tampered with');
  }
  
  // Decrypt the data
  return hybridDecrypt(encrypted, recipientDecryptionKey);
}

/**
 * Generate complete key set for a user (both KEM and DSA)
 */
export function generateUserKeySet(): {
  kem: MlKemKeyPair;
  dsa: MlDsaKeyPair;
} {
  return {
    kem: generateMlKemKeyPair(),
    dsa: generateMlDsaKeyPair(),
  };
}

/**
 * Check if data is encrypted with quantum-resistant encryption
 */
export function isQuantumEncrypted(encryptedBase64: string): boolean {
  try {
    const combined = base64ToUint8Array(encryptedBase64);
    return combined[0] === QUANTUM_ENCRYPTION_VERSION;
  } catch {
    return false;
  }
}
