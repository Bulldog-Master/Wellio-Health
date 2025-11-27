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
    const body = await req.json();
    console.log('[Passkey Register] Request body received:', {
      hasCredentialId: !!body.credentialId,
      hasPublicKey: !!body.publicKey,
      hasUserId: !!body.userId,
      counter: body.counter,
      deviceType: body.deviceType
    });

    const { credentialId, publicKey, counter, deviceType, userId } = body;

    if (!credentialId || !publicKey || !userId) {
      console.error('[Passkey Register] Missing required fields');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          received: { hasCredentialId: !!credentialId, hasPublicKey: !!publicKey, hasUserId: !!userId }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Passkey Register] Storing credential for user:', userId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Passkey Register] Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key to bypass RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

    // Store the credential
    const { data, error } = await supabaseAdmin
      .from('webauthn_credentials')
      .insert({
        user_id: userId,
        credential_id: credentialId,
        public_key: publicKey,
        counter: counter || 0,
        device_type: deviceType || 'unknown',
      })
      .select()
      .single();

    if (error) {
      console.error('[Passkey Register] Database error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return new Response(
        JSON.stringify({ 
          error: 'Failed to store credential',
          message: error.message,
          code: error.code
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Passkey Register] Credential stored successfully!', data?.id);

    return new Response(
      JSON.stringify({ success: true, id: data?.id }),
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
