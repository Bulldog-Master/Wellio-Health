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
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[Passkey Register] Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SECURITY FIX: Validate the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[Passkey Register] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('[Passkey Register] Authentication failed:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    console.log('[Passkey Register] Request body received:', {
      hasCredentialId: !!body.credentialId,
      hasPublicKey: !!body.publicKey,
      hasUserId: !!body.userId,
      counter: body.counter,
      deviceType: body.deviceType
    });

    const { credentialId, publicKey, counter, deviceType, userId } = body;

    // SECURITY FIX: Validate that userId matches the authenticated user
    if (userId !== user.id) {
      console.error('[Passkey Register] User ID mismatch - attempted:', userId, 'authenticated:', user.id);
      return new Response(
        JSON.stringify({ error: 'Cannot register passkey for another user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!credentialId || !publicKey) {
      console.error('[Passkey Register] Missing required fields');
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          received: { hasCredentialId: !!credentialId, hasPublicKey: !!publicKey }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Passkey Register] Storing credential for authenticated user:', user.id);

    // Store the credential using the authenticated user's ID (not the one from body)
    const { data, error } = await supabaseAdmin
      .from('webauthn_credentials')
      .insert({
        user_id: user.id, // Use authenticated user ID, not body.userId
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
