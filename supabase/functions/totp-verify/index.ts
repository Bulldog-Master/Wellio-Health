import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[TOTP Verify] Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('[TOTP Verify] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('[TOTP Verify] No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key to verify the JWT and get user
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    console.log('[TOTP Verify] Verifying JWT token...');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[TOTP Verify] Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[TOTP Verify] User authenticated:', user.id);
    const body = await req.json();
    const totpToken = body.token;
    console.log('[TOTP Verify] TOTP token received, length:', totpToken?.length);

    // Fetch the user's 2FA secret
    console.log('[TOTP Verify] Fetching user profile...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('two_factor_secret')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[TOTP Verify] Error fetching profile:', profileError);
    }

    if (!profile?.two_factor_secret) {
      console.error('[TOTP Verify] 2FA not set up for user');
      return new Response(
        JSON.stringify({ error: '2FA not set up' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[TOTP Verify] Verifying TOTP token...');
    // Verify the TOTP token
    const isValid = await verifyTOTP(profile.two_factor_secret, totpToken);
    console.log('[TOTP Verify] Token valid:', isValid);

    if (isValid) {
      // Enable 2FA for the user
      console.log('[TOTP Verify] Enabling 2FA for user...');
      const { error } = await supabaseAdmin
        .from('profiles')
        .update({ two_factor_enabled: true })
        .eq('id', user.id);

      if (error) {
        console.error('[TOTP Verify] Error enabling 2FA:', error);
        throw error;
      }

      console.log('[TOTP Verify] 2FA enabled successfully!');
      return new Response(
        JSON.stringify({ success: true, verified: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log('[TOTP Verify] Invalid token');
      return new Response(
        JSON.stringify({ success: false, verified: false, error: 'Invalid token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in totp-verify:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function verifyTOTP(secret: string, token: string): Promise<boolean> {
  const window = 1; // Allow 1 time step before and after
  const currentTime = Math.floor(Date.now() / 1000);
  const timeStep = 30;

  for (let i = -window; i <= window; i++) {
    const time = Math.floor(currentTime / timeStep) + i;
    const expectedToken = await generateTOTP(secret, time);
    if (expectedToken === token) {
      return true;
    }
  }

  return false;
}

async function generateTOTP(secret: string, timeCounter: number): Promise<string> {
  const key = base32Decode(secret);
  const time = new DataView(new ArrayBuffer(8));
  time.setUint32(4, timeCounter, false);

  const hash = await hmacSHA1(key, new Uint8Array(time.buffer));
  const offset = hash[hash.length - 1] & 0x0f;
  const binary = 
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff);
  
  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

function base32Decode(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let index = 0;
  const output = new Uint8Array(Math.ceil(base32.length * 5 / 8));

  for (let i = 0; i < base32.length; i++) {
    const idx = alphabet.indexOf(base32[i].toUpperCase());
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }

  return output.slice(0, index);
}

async function hmacSHA1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  // Create proper ArrayBuffer copies to ensure type compatibility
  const keyBuffer = new Uint8Array(key).buffer as ArrayBuffer;
  const messageBuffer = new Uint8Array(message).buffer as ArrayBuffer;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
  return new Uint8Array(signature);
}