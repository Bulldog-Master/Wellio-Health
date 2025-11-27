import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[TOTP Setup] Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    console.log('[TOTP Setup] Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[TOTP Setup] Creating Supabase client...');
    const authHeader = req.headers.get('Authorization');
    console.log('[TOTP Setup] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('[TOTP Setup] No authorization header');
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
    console.log('[TOTP Setup] Verifying JWT token...');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError) {
      console.error('[TOTP Setup] Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate user', details: userError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!user) {
      console.error('[TOTP Setup] No user found');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - no user found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[TOTP Setup] User authenticated:', user.id);

    // Generate a random secret for TOTP (base32 encoded)
    console.log('[TOTP Setup] Generating TOTP secret...');
    const secret = generateTOTPSecret();
    console.log('[TOTP Setup] Secret generated');
    
    // Get user profile for account name
    console.log('[TOTP Setup] Fetching user profile...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('username, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('[TOTP Setup] Error fetching profile:', profileError);
    }

    const accountName = profile?.username || profile?.full_name || user.email;
    const issuer = 'Wellio';
    const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName || '')}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    console.log('[TOTP Setup] OTP auth URL created');

    // Store the secret temporarily (not enabled yet)
    console.log('[TOTP Setup] Storing secret in database...');
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ two_factor_secret: secret })
      .eq('id', user.id);

    if (updateError) {
      console.error('[TOTP Setup] Error storing 2FA secret:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to store 2FA secret', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[TOTP Setup] Success! Returning QR code URL');
    return new Response(
      JSON.stringify({ 
        secret,
        qrCodeUrl: otpauthUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[TOTP Setup] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
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
