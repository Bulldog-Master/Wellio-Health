/**
 * React hook for quantum-resistant encryption operations
 * Manages key generation, storage, and encryption/decryption for medical data
 */

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  generateMlKemKeyPair,
  generateMlDsaKeyPair,
  hybridEncrypt,
  hybridDecrypt,
  signData,
  verifySignature,
  serializeKeyPair,
  base64ToUint8Array,
  uint8ArrayToBase64,
  QUANTUM_ENCRYPTION_VERSION,
} from '@/lib/encryption';

const STORAGE_KEY_KEM = 'quantum_kem_keypair';
const STORAGE_KEY_DSA = 'quantum_dsa_keypair';

interface QuantumKeyState {
  kemPublicKey: string | null;
  dsaPublicKey: string | null;
  hasKeys: boolean;
  isGenerating: boolean;
}

export const useQuantumEncryption = () => {
  const [state, setState] = useState<QuantumKeyState>({
    kemPublicKey: null,
    dsaPublicKey: null,
    hasKeys: false,
    isGenerating: false,
  });

  // Check for existing keys on mount
  useEffect(() => {
    const checkExistingKeys = () => {
      try {
        const kemData = localStorage.getItem(STORAGE_KEY_KEM);
        const dsaData = localStorage.getItem(STORAGE_KEY_DSA);
        
        if (kemData && dsaData) {
          const kemParsed = JSON.parse(kemData);
          const dsaParsed = JSON.parse(dsaData);
          
          setState({
            kemPublicKey: kemParsed.publicKey,
            dsaPublicKey: dsaParsed.publicKey,
            hasKeys: true,
            isGenerating: false,
          });
        }
      } catch (error) {
        console.error('Error checking quantum keys:', error);
      }
    };

    checkExistingKeys();
  }, []);

  /**
   * Generate and store quantum-resistant key pairs
   */
  const generateAndStoreKeys = useCallback(async (): Promise<{
    kemPublicKey: string;
    dsaPublicKey: string;
  }> => {
    setState(prev => ({ ...prev, isGenerating: true }));

    try {
      // Generate key pairs
      const kemKeyPair = generateMlKemKeyPair();
      const dsaKeyPair = generateMlDsaKeyPair();
      
      // Serialize for storage
      const serializedKem = serializeKeyPair(kemKeyPair);
      const serializedDsa = serializeKeyPair(dsaKeyPair);
      
      // Store locally (secret keys never leave the device)
      localStorage.setItem(STORAGE_KEY_KEM, JSON.stringify(serializedKem));
      localStorage.setItem(STORAGE_KEY_DSA, JSON.stringify(serializedDsa));
      
      // Store public keys in Supabase for key exchange
      // Using the existing user_encryption_keys table
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_encryption_keys').upsert({
          user_id: user.id,
          public_key: serializedKem.publicKey,
          signing_public_key: serializedDsa.publicKey,
          key_type: 'ml_kem_768',
        });
      }
      
      setState({
        kemPublicKey: serializedKem.publicKey,
        dsaPublicKey: serializedDsa.publicKey,
        hasKeys: true,
        isGenerating: false,
      });
      
      return {
        kemPublicKey: serializedKem.publicKey,
        dsaPublicKey: serializedDsa.publicKey,
      };
    } catch (error) {
      console.error('Error generating quantum keys:', error);
      setState(prev => ({ ...prev, isGenerating: false }));
      throw error;
    }
  }, []);

  /**
   * Encrypt data for self (using own public key)
   */
  const encryptForSelf = useCallback(async (data: string): Promise<string> => {
    const kemData = localStorage.getItem(STORAGE_KEY_KEM);
    if (!kemData) {
      throw new Error('No encryption keys found. Please generate keys first.');
    }
    
    const { publicKey } = JSON.parse(kemData);
    const publicKeyBytes = base64ToUint8Array(publicKey);
    
    return hybridEncrypt(data, publicKeyBytes);
  }, []);

  /**
   * Decrypt data encrypted for self
   */
  const decryptForSelf = useCallback(async (encryptedData: string): Promise<string> => {
    const kemData = localStorage.getItem(STORAGE_KEY_KEM);
    if (!kemData) {
      throw new Error('No encryption keys found.');
    }
    
    const { secretKey } = JSON.parse(kemData);
    const secretKeyBytes = base64ToUint8Array(secretKey);
    
    return hybridDecrypt(encryptedData, secretKeyBytes);
  }, []);

  /**
   * Encrypt data for another user (using their public key)
   */
  const encryptForUser = useCallback(async (
    data: string,
    recipientUserId: string
  ): Promise<string> => {
    // Fetch recipient's public key from Supabase
    const { data: keyData, error } = await supabase
      .from('user_encryption_keys')
      .select('public_key')
      .eq('user_id', recipientUserId)
      .single();
    
    if (error || !keyData) {
      throw new Error('Recipient public key not found');
    }
    
    const publicKeyBytes = base64ToUint8Array(keyData.public_key);
    return hybridEncrypt(data, publicKeyBytes);
  }, []);

  /**
   * Sign data with own signing key
   */
  const signDataWithKey = useCallback(async (data: string): Promise<string> => {
    const dsaData = localStorage.getItem(STORAGE_KEY_DSA);
    if (!dsaData) {
      throw new Error('No signing keys found.');
    }
    
    const { secretKey } = JSON.parse(dsaData);
    const secretKeyBytes = base64ToUint8Array(secretKey);
    
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    const signature = signData(dataBytes, secretKeyBytes);
    
    return uint8ArrayToBase64(signature);
  }, []);

  /**
   * Verify signature from another user
   */
  const verifyUserSignature = useCallback(async (
    data: string,
    signature: string,
    signerUserId: string
  ): Promise<boolean> => {
    // Fetch signer's public key from Supabase
    const { data: keyData, error } = await supabase
      .from('user_encryption_keys')
      .select('signing_public_key')
      .eq('user_id', signerUserId)
      .single();
    
    if (error || !keyData || !keyData.signing_public_key) {
      throw new Error('Signer public key not found');
    }
    
    const publicKeyBytes = base64ToUint8Array(keyData.signing_public_key);
    const signatureBytes = base64ToUint8Array(signature);
    
    const encoder = new TextEncoder();
    const dataBytes = encoder.encode(data);
    
    return verifySignature(dataBytes, signatureBytes, publicKeyBytes);
  }, []);

  /**
   * Check if we need to upgrade encryption version
   */
  const needsUpgrade = useCallback((currentVersion: number | null): boolean => {
    return !currentVersion || currentVersion < QUANTUM_ENCRYPTION_VERSION;
  }, []);

  /**
   * Clear local keys (for logout)
   */
  const clearKeys = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_KEM);
    localStorage.removeItem(STORAGE_KEY_DSA);
    setState({
      kemPublicKey: null,
      dsaPublicKey: null,
      hasKeys: false,
      isGenerating: false,
    });
  }, []);

  return {
    ...state,
    generateAndStoreKeys,
    encryptForSelf,
    decryptForSelf,
    encryptForUser,
    signDataWithKey,
    verifyUserSignature,
    needsUpgrade,
    clearKeys,
    QUANTUM_ENCRYPTION_VERSION,
  };
};
