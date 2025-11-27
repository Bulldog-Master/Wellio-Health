import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { create } from 'https://deno.land/x/djwt@v2.8/mod.ts';

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

    // Generate a random secret for TOTP (base32 encoded)
    const secret = generateTOTPSecret();
    
    // Create the otpauth URL for QR code generation
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .single();

    const accountName = profile?.username || profile?.full_name || user.email;
    const issuer = 'HealthTracker';
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName || '')}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

    // Store the secret temporarily (not enabled yet)
    const { error } = await supabaseClient
      .from('profiles')
      .update({ two_factor_secret: secret })
      .eq('id', user.id);

    if (error) {
      console.error('Error storing 2FA secret:', error);
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        secret,
        qrCodeUrl: otpauthUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in totp-setup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  
  for (let i = 0; i < 32; i++) {
    secret += chars[randomBytes[i] % chars.length];
  }
  
  return secret;
}