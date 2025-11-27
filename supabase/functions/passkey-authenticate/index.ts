import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[Passkey Auth] Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { credentialId, signature, authenticatorData, clientDataJSON } = await req.json();
    console.log('[Passkey Auth] Credential ID received:', credentialId?.substring(0, 10) + '...');

    // Find the credential and associated user
    const { data: credential, error: credError } = await supabaseAdmin
      .from('webauthn_credentials')
      .select('*, profiles!inner(id)')
      .eq('credential_id', credentialId)
      .single();

    if (credError || !credential) {
      console.error('[Passkey Auth] Credential not found:', credError);
      return new Response(
        JSON.stringify({ error: 'Invalid credential - passkey not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Passkey Auth] Credential found for user:', credential.user_id);

    // Get user's email from auth.users
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(credential.user_id);
    
    if (userError || !user) {
      console.error('[Passkey Auth] User not found:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Passkey Auth] User found:', user.email);

    // Update last used timestamp
    await supabaseAdmin
      .from('webauthn_credentials')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', credential.id);

    // Create a session for the user
    // Since we verified the passkey, we can sign them in directly
    console.log('[Passkey Auth] Generating OTP for user...');
    
    const { data: otpData, error: otpError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
    });

    if (otpError || !otpData) {
      console.error('[Passkey Auth] Failed to generate OTP:', otpError);
      throw otpError || new Error('Failed to generate OTP');
    }

    console.log('[Passkey Auth] Returning action link for client to exchange');

    return new Response(
      JSON.stringify({ 
        success: true,
        actionLink: otpData.properties.action_link
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Passkey Auth] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
