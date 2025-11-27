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

    const { backupCode } = await req.json();
    
    if (!backupCode) {
      return new Response(
        JSON.stringify({ error: 'Backup code is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's backup codes
    const { data: authSecret, error: fetchError } = await supabaseClient
      .from('auth_secrets')
      .select('backup_codes')
      .eq('user_id', user.id)
      .single();

    if (fetchError || !authSecret) {
      console.error('Error fetching backup codes:', fetchError);
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
      return new Response(
        JSON.stringify({ verified: false, error: 'Invalid backup code' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Remove used backup code
    const updatedCodes = backupCodes.filter((_: string, i: number) => i !== codeIndex);
    
    const { error: updateError } = await supabaseClient
      .from('auth_secrets')
      .update({ backup_codes: updatedCodes })
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating backup codes:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update backup codes' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        verified: true, 
        remainingCodes: updatedCodes.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in totp-verify-backup:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
