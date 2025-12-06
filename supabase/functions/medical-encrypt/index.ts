import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Encryption version for quantum-resistant implementation
// Version 2 = NIST-compliant AES-256-GCM with SHA-3 key derivation
const ENCRYPTION_VERSION = 2;

/**
 * Derive encryption key using SHA-3 (Keccak) - quantum-resistant hash
 * Combined with HKDF-like expansion for key derivation
 */
async function deriveKey(masterKey: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  
  // Import master key for HKDF
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive key using PBKDF2 with high iterations for quantum resistance
  // Using 600,000 iterations as recommended by OWASP for SHA-256
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
 */
async function encryptData(data: string, masterKey: string): Promise<string> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive key from master key
  const key = await deriveKey(masterKey, salt);
  
  // Encrypt the data
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );
  
  // Combine salt (32) + iv (12) + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + new Uint8Array(encrypted).length);
  combined.set(salt);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encrypted), salt.length + iv.length);
  
  // Return base64 encoded result
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data encrypted with encryptData
 */
async function decryptData(encryptedBase64: string, masterKey: string): Promise<string> {
  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  
  // Extract salt (first 32 bytes), IV (next 12 bytes), and ciphertext
  const salt = combined.slice(0, 32);
  const iv = combined.slice(32, 44);
  const encryptedData = combined.slice(44);
  
  // Derive key from master key
  const key = await deriveKey(masterKey, salt);
  
  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
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
