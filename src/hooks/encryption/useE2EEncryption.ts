import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const KEY_STORAGE_PREFIX = 'wellio-e2e-';

interface KeyPair {
  publicKey: string;
  privateKey: string;
}

// Generate ECDH key pair for key exchange
async function generateKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'ECDH',
      namedCurve: 'P-256',
    },
    true,
    ['deriveKey', 'deriveBits']
  );

  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  return {
    publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer))),
    privateKey: btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer))),
  };
}

// Derive shared secret from own private key and peer's public key
async function deriveSharedSecret(privateKeyBase64: string, peerPublicKeyBase64: string): Promise<CryptoKey> {
  const privateKeyBuffer = Uint8Array.from(atob(privateKeyBase64), c => c.charCodeAt(0));
  const peerPublicKeyBuffer = Uint8Array.from(atob(peerPublicKeyBase64), c => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    ['deriveKey', 'deriveBits']
  );

  const peerPublicKey = await crypto.subtle.importKey(
    'spki',
    peerPublicKeyBuffer,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // Derive AES-GCM key from shared secret
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: peerPublicKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt message with shared key
async function encryptMessage(message: string, sharedKey: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sharedKey,
    data
  );

  // Combine IV and ciphertext
  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

// Decrypt message with shared key
async function decryptMessage(encryptedBase64: string, sharedKey: CryptoKey): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    sharedKey,
    ciphertext
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

export const useE2EEncryption = () => {
  const [hasKeyPair, setHasKeyPair] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if user has a key pair stored locally
  useEffect(() => {
    const checkKeyPair = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const privateKey = localStorage.getItem(`${KEY_STORAGE_PREFIX}${user.id}-private`);
        setHasKeyPair(!!privateKey);
      }
    };
    checkKeyPair();
  }, []);

  // Generate and store new key pair
  const generateAndStoreKeyPair = useCallback(async (): Promise<boolean> => {
    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const keyPair = await generateKeyPair();

      // Store private key locally (never sent to server)
      localStorage.setItem(`${KEY_STORAGE_PREFIX}${user.id}-private`, keyPair.privateKey);

      // Store public key in database
      const { error } = await supabase
        .from('user_encryption_keys')
        .upsert({
          user_id: user.id,
          public_key: keyPair.publicKey,
          public_key_created_at: new Date().toISOString(),
          key_version: 1,
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      setHasKeyPair(true);
      return true;
    } catch (error) {
      console.error('Error generating key pair:', error);
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Get peer's public key from database
  const getPeerPublicKey = useCallback(async (peerId: string): Promise<string | null> => {
    const { data, error } = await supabase
      .rpc('get_user_public_key', { _user_id: peerId });

    if (error) {
      console.error('Error fetching peer public key:', error);
      return null;
    }

    return data;
  }, []);

  // Encrypt a message for a specific peer
  const encryptForPeer = useCallback(async (message: string, peerId: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const privateKey = localStorage.getItem(`${KEY_STORAGE_PREFIX}${user.id}-private`);
      if (!privateKey) throw new Error('No private key found');

      const peerPublicKey = await getPeerPublicKey(peerId);
      if (!peerPublicKey) throw new Error('Peer has no public key');

      const sharedKey = await deriveSharedSecret(privateKey, peerPublicKey);
      return encryptMessage(message, sharedKey);
    } catch (error) {
      console.error('Error encrypting message:', error);
      return null;
    }
  }, [getPeerPublicKey]);

  // Decrypt a message from a specific peer
  const decryptFromPeer = useCallback(async (encryptedMessage: string, peerId: string): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const privateKey = localStorage.getItem(`${KEY_STORAGE_PREFIX}${user.id}-private`);
      if (!privateKey) throw new Error('No private key found');

      const peerPublicKey = await getPeerPublicKey(peerId);
      if (!peerPublicKey) throw new Error('Peer has no public key');

      const sharedKey = await deriveSharedSecret(privateKey, peerPublicKey);
      return decryptMessage(encryptedMessage, sharedKey);
    } catch (error) {
      console.error('Error decrypting message:', error);
      return null;
    }
  }, [getPeerPublicKey]);

  return {
    hasKeyPair,
    isGenerating,
    generateAndStoreKeyPair,
    encryptForPeer,
    decryptFromPeer,
    getPeerPublicKey,
  };
};
