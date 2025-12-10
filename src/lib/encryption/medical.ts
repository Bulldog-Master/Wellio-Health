/**
 * Client-side utilities for quantum-resistant medical data encryption
 * Uses edge function for server-side encryption with MEDICAL_ENCRYPTION_KEY
 */

import { supabase } from '@/integrations/supabase/client';

// Current encryption version (matches edge function)
export const ENCRYPTION_VERSION = 2;

export interface EncryptResult {
  encrypted: string;
  version: number;
}

export interface DecryptResult {
  decrypted: string;
}

/**
 * Encrypt sensitive medical data using the server-side quantum-resistant encryption
 * @param data The plaintext data to encrypt
 * @param recordId Optional record ID for audit logging
 * @param tableName Optional table name for audit logging
 */
export async function encryptMedicalData(
  data: string,
  recordId?: string,
  tableName?: string
): Promise<EncryptResult> {
  const { data: result, error } = await supabase.functions.invoke('medical-encrypt', {
    body: {
      action: 'encrypt',
      data,
      recordId,
      tableName,
    },
  });

  if (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt medical data');
  }

  return result as EncryptResult;
}

/**
 * Decrypt sensitive medical data using the server-side quantum-resistant decryption
 * @param encryptedData The encrypted data to decrypt
 * @param recordId Optional record ID for audit logging
 * @param tableName Optional table name for audit logging
 */
export async function decryptMedicalData(
  encryptedData: string,
  recordId?: string,
  tableName?: string
): Promise<string> {
  const { data: result, error } = await supabase.functions.invoke('medical-encrypt', {
    body: {
      action: 'decrypt',
      data: encryptedData,
      recordId,
      tableName,
    },
  });

  if (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt medical data');
  }

  return (result as DecryptResult).decrypted;
}

/**
 * Check if encrypted data needs migration to newer encryption version
 * @param currentVersion The encryption version of the stored data
 */
export function needsEncryptionMigration(currentVersion: number | null): boolean {
  return currentVersion === null || currentVersion < ENCRYPTION_VERSION;
}

/**
 * Re-encrypt data with the latest encryption version
 * @param encryptedData The currently encrypted data
 * @param currentVersion The current encryption version
 * @param recordId Record ID for audit logging
 * @param tableName Table name for audit logging
 */
export async function migrateEncryption(
  encryptedData: string,
  currentVersion: number,
  recordId: string,
  tableName: string
): Promise<EncryptResult> {
  // First decrypt with the old version (edge function handles version detection)
  const decrypted = await decryptMedicalData(encryptedData, recordId, tableName);
  
  // Re-encrypt with the latest version
  return encryptMedicalData(decrypted, recordId, tableName);
}
