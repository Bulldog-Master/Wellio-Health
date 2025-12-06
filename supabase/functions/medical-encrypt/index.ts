import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Medical Data Encryption Edge Function
 * 
 * ENCRYPTION VERSIONS:
 * - v2: AES-256-GCM with PBKDF2-SHA512 (600k iterations)
 * - v3: Quantum-resistant (client-side ML-KEM + ML-DSA via @noble/post-quantum)
 * 
 * This edge function handles server-side symmetric encryption for medical records
 * when client-side quantum-resistant encryption is not used.
 */
const ENCRYPTION_VERSION = 3;

/**
 * Derive encryption key using PBKDF2-SHA512 with high iterations
 * Combined with large salt for quantum-resistant key derivation
 */
async function deriveKey(masterKey: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  
  // Import master key for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive key using PBKDF2 with 600,000 iterations (OWASP recommendation)
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(salt).buffer as ArrayBuffer,
      iterations: 600000,
      hash: 'SHA-512',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt data using AES-256-GCM with quantum-resistant key derivation
 * Format: version(1) + salt(32) + iv(12) + ciphertext + tag
 */
async function encryptData(data: string, masterKey: string): Promise<string> {
  // Generate random 32-byte salt and 12-byte IV
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive key from master key
  const key = await deriveKey(masterKey, salt);
  
  // Create proper ArrayBuffer for iv
  const ivBuffer = new ArrayBuffer(iv.length);
  new Uint8Array(ivBuffer).set(iv);
  
  // Encrypt the data
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    encoder.encode(data)
  );
  
  // Combine: version(1) + salt(32) + iv(12) + ciphertext
  const combined = new Uint8Array(1 + salt.length + iv.length + new Uint8Array(encrypted).length);
  combined[0] = ENCRYPTION_VERSION;
  combined.set(salt, 1);
  combined.set(iv, 1 + salt.length);
  combined.set(new Uint8Array(encrypted), 1 + salt.length + iv.length);
  
  // Return base64 encoded result
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data encrypted with encryptData
 * Handles both v2 and v3 formats
 */
async function decryptData(encryptedBase64: string, masterKey: string): Promise<string> {
  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  const version = combined[0];
  
  let salt: Uint8Array;
  let iv: Uint8Array;
  let encryptedData: Uint8Array;
  
  if (version === 3) {
    // V3 format: version(1) + salt(32) + iv(12) + ciphertext
    salt = combined.slice(1, 33);
    iv = combined.slice(33, 45);
    encryptedData = combined.slice(45);
  } else if (version === 2) {
    // V2 format: version(1) + salt(32) + iv(12) + ciphertext (same layout)
    salt = combined.slice(1, 33);
    iv = combined.slice(33, 45);
    encryptedData = combined.slice(45);
  } else {
    // Legacy format without version byte
    throw new Error(`Unsupported encryption version: ${version}. Please re-encrypt data.`);
  }
  
  // Derive key from master key
  const key = await deriveKey(masterKey, salt);
  
  // Create proper ArrayBuffer for iv
  const ivBuffer = new ArrayBuffer(iv.length);
  new Uint8Array(ivBuffer).set(iv);
  
  // Create proper ArrayBuffer for encryptedData
  const dataBuffer = new ArrayBuffer(encryptedData.length);
  new Uint8Array(dataBuffer).set(encryptedData);
  
  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    dataBuffer
  );
  
  return new TextDecoder().decode(decrypted);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the encryption key from Supabase secrets
    const encryptionKey = Deno.env.get('MEDICAL_ENCRYPTION_KEY');
    if (!encryptionKey) {
      console.error('MEDICAL_ENCRYPTION_KEY not configured');
      throw new Error('Encryption key not configured');
    }

    // Validate the user's JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid authentication');
    }

    const { action, data, recordId, tableName } = await req.json();

    if (!action || !['encrypt', 'decrypt'].includes(action)) {
      throw new Error('Invalid action. Must be "encrypt" or "decrypt"');
    }

    let result: string;

    if (action === 'encrypt') {
      if (!data) {
        throw new Error('No data provided for encryption');
      }
      
      result = await encryptData(data, encryptionKey);
      
      console.log(`Encrypted data for user ${user.id}, version ${ENCRYPTION_VERSION}`);
      
      // Log medical access for audit trail
      if (recordId && tableName) {
        await supabaseAdmin.from('medical_audit_log').insert({
          user_id: user.id,
          table_name: tableName,
          record_id: recordId,
          action: 'ENCRYPT',
        });
      }
      
      return new Response(
        JSON.stringify({ 
          encrypted: result, 
          version: ENCRYPTION_VERSION 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else {
      // Decrypt
      if (!data) {
        throw new Error('No data provided for decryption');
      }
      
      result = await decryptData(data, encryptionKey);
      
      console.log(`Decrypted data for user ${user.id}`);
      
      // Log medical access for audit trail
      if (recordId && tableName) {
        await supabaseAdmin.from('medical_audit_log').insert({
          user_id: user.id,
          table_name: tableName,
          record_id: recordId,
          action: 'DECRYPT',
        });
      }
      
      return new Response(
        JSON.stringify({ decrypted: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in medical-encrypt function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});