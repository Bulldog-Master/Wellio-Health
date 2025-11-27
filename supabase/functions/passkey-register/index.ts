import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[Passkey Register] Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('[Passkey Register] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('[Passkey Register] No authorization header');
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
    console.log('[Passkey Register] Verifying JWT token...');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[Passkey Register] Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Passkey Register] User authenticated:', user.id);

    const { credentialId, publicKey, counter, deviceType } = await req.json();
    console.log('[Passkey Register] Storing credential...');

    // Store the credential
    const { error } = await supabaseAdmin
      .from('webauthn_credentials')
      .insert({
        user_id: user.id,
        credential_id: credentialId,
        public_key: publicKey,
        counter: counter,
        device_type: deviceType || 'unknown',
      });

    if (error) {
      console.error('[Passkey Register] Error storing credential:', error);
      throw error;
    }

    console.log('[Passkey Register] Credential stored successfully!');

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Passkey Register] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
