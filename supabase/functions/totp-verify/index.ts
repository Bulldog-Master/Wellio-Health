import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token } = await req.json();

    // Fetch the user's 2FA secret
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('two_factor_secret')
      .eq('id', user.id)
      .single();

    if (!profile?.two_factor_secret) {
      return new Response(
        JSON.stringify({ error: '2FA not set up' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the TOTP token
    const isValid = await verifyTOTP(profile.two_factor_secret, token);

    if (isValid) {
      // Enable 2FA for the user
      const { error } = await supabaseClient
        .from('profiles')
        .update({ two_factor_enabled: true })
        .eq('id', user.id);

      if (error) {
        console.error('Error enabling 2FA:', error);
        throw error;
      }

      return new Response(
        JSON.stringify({ success: true, verified: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
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