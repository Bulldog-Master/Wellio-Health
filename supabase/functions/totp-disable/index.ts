import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[TOTP Disable] Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('[TOTP Disable] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('[TOTP Disable] No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role key to access auth_secrets table (RLS blocks anon key)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    console.log('[TOTP Disable] Verifying JWT token...');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[TOTP Disable] Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[TOTP Disable] User authenticated:', user.id);

    // Disable 2FA and clear the secret
    console.log('[TOTP Disable] Disabling 2FA for user...');
    const { error } = await supabaseAdmin
      .from('auth_secrets')
      .update({ 
        two_factor_enabled: false,
        two_factor_secret: null,
        backup_codes: null
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('[TOTP Disable] Error disabling 2FA:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to disable 2FA', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[TOTP Disable] 2FA disabled successfully!');
    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[TOTP Disable] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
