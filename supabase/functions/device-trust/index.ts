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

    const { action, deviceFingerprint, deviceName } = await req.json();

    if (action === 'check') {
      // Check if device is trusted
      const { data, error } = await supabaseClient
        .from('trusted_devices')
        .select('id, last_used_at')
        .eq('user_id', user.id)
        .eq('device_fingerprint', deviceFingerprint)
        .maybeSingle();

      if (error) {
        console.error('Error checking device trust:', error);
        return new Response(
          JSON.stringify({ trusted: false }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update last_used_at if device exists
      if (data) {
        await supabaseClient
          .from('trusted_devices')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', data.id);
      }

      return new Response(
        JSON.stringify({ trusted: !!data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'trust') {
      // Add device to trusted list
      const { error } = await supabaseClient
        .from('trusted_devices')
        .insert({
          user_id: user.id,
          device_fingerprint: deviceFingerprint,
          device_name: deviceName || 'Unknown Device',
        });

      if (error) {
        console.error('Error trusting device:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to trust device' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'list') {
      // List all trusted devices
      const { data, error } = await supabaseClient
        .from('trusted_devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_used_at', { ascending: false });

      if (error) {
        console.error('Error listing devices:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to list devices' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ devices: data }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'remove') {
      const { deviceId } = await req.json();
      
      const { error } = await supabaseClient
        .from('trusted_devices')
        .delete()
        .eq('id', deviceId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing device:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to remove device' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in device-trust:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
