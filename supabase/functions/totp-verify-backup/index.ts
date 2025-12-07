import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('[TOTP Verify Backup] Request received:', req.method);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('[TOTP Verify Backup] Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('[TOTP Verify Backup] No authorization header');
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
    console.log('[TOTP Verify Backup] Verifying JWT token...');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[TOTP Verify Backup] Error getting user:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[TOTP Verify Backup] User authenticated:', user.id);

    const { backupCode } = await req.json();
    
    if (!backupCode) {
      return new Response(
        JSON.stringify({ error: 'Backup code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's backup codes
    console.log('[TOTP Verify Backup] Fetching backup codes...');
    const { data: authSecret, error: fetchError } = await supabaseAdmin
      .from('auth_secrets')
      .select('backup_codes')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !authSecret) {
      console.error('[TOTP Verify Backup] Error fetching backup codes:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch backup codes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const backupCodes = authSecret.backup_codes || [];
    
    // Check if backup code is valid (case-insensitive)
    const normalizedInput = backupCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const codeIndex = backupCodes.findIndex(
      (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '') === normalizedInput
    );

    if (codeIndex === -1) {
      console.log('[TOTP Verify Backup] Invalid backup code');
      return new Response(
        JSON.stringify({ verified: false, error: 'Invalid backup code' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove used backup code
    console.log('[TOTP Verify Backup] Removing used backup code...');
    const updatedCodes = backupCodes.filter((_: string, i: number) => i !== codeIndex);
    
    const { error: updateError } = await supabaseAdmin
      .from('auth_secrets')
      .update({ backup_codes: updatedCodes })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('[TOTP Verify Backup] Error updating backup codes:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update backup codes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[TOTP Verify Backup] Backup code verified successfully!');
    return new Response(
      JSON.stringify({ 
        verified: true, 
        remainingCodes: updatedCodes.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[TOTP Verify Backup] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
