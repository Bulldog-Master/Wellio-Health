import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Suunto API endpoints
const SUUNTO_AUTH_URL = 'https://cloudapi-oauth.suunto.com/oauth/authorize';
const SUUNTO_TOKEN_URL = 'https://cloudapi-oauth.suunto.com/oauth/token';
const SUUNTO_API_BASE = 'https://cloudapi.suunto.com/v2';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const suuntoClientId = Deno.env.get('SUUNTO_CLIENT_ID');
    const suuntoClientSecret = Deno.env.get('SUUNTO_CLIENT_SECRET');

    // Check if Suunto credentials are configured
    if (!suuntoClientId || !suuntoClientSecret) {
      return new Response(
        JSON.stringify({ 
          error: 'Suunto integration not configured',
          message: 'SUUNTO_CLIENT_ID and SUUNTO_CLIENT_SECRET must be set'
        }),
        { 
          status: 503, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, code, redirectUri, startDate, endDate } = await req.json();

    switch (action) {
      case 'get_auth_url': {
        // Generate OAuth authorization URL for Suunto
        const state = crypto.randomUUID();
        const authUrl = `${SUUNTO_AUTH_URL}?client_id=${suuntoClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
        
        return new Response(
          JSON.stringify({ authUrl, state }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'exchange_token': {
        // Exchange authorization code for access token
        const tokenResponse = await fetch(SUUNTO_TOKEN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: suuntoClientId,
            client_secret: suuntoClientSecret,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          console.error('Suunto token exchange failed:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to exchange token' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const tokenData = await tokenResponse.json();

        // Store tokens securely (you may want to encrypt these)
        const { error: upsertError } = await supabaseAdmin
          .from('wearable_connections')
          .upsert({
            user_id: user.id,
            provider: 'suunto',
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,provider' });

        if (upsertError) {
          console.error('Error storing Suunto tokens:', upsertError);
          return new Response(
            JSON.stringify({ error: 'Failed to store tokens' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync_workouts': {
        // Get stored tokens
        const { data: connection, error: connError } = await supabaseAdmin
          .from('wearable_connections')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'suunto')
          .single();

        if (connError || !connection) {
          return new Response(
            JSON.stringify({ error: 'Suunto not connected' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if token needs refresh
        let accessToken = connection.access_token;
        if (new Date(connection.expires_at) < new Date()) {
          // Refresh token
          const refreshResponse = await fetch(SUUNTO_TOKEN_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: connection.refresh_token,
              client_id: suuntoClientId,
              client_secret: suuntoClientSecret,
            }),
          });

          if (!refreshResponse.ok) {
            return new Response(
              JSON.stringify({ error: 'Failed to refresh token', needsReauth: true }),
              { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const refreshData = await refreshResponse.json();
          accessToken = refreshData.access_token;

          // Update stored tokens
          await supabaseAdmin
            .from('wearable_connections')
            .update({
              access_token: refreshData.access_token,
              refresh_token: refreshData.refresh_token || connection.refresh_token,
              expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('provider', 'suunto');
        }

        // Fetch workouts from Suunto
        const workoutsUrl = `${SUUNTO_API_BASE}/workouts?since=${startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}&until=${endDate || new Date().toISOString()}`;
        
        const workoutsResponse = await fetch(workoutsUrl, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!workoutsResponse.ok) {
          const errorText = await workoutsResponse.text();
          console.error('Suunto workouts fetch failed:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch workouts' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const workoutsData = await workoutsResponse.json();
        const workouts = workoutsData.payload || [];

        // Store workouts as wearable data
        for (const workout of workouts) {
          const dataDate = new Date(workout.startTime).toISOString().split('T')[0];
          
          await supabaseAdmin
            .from('wearable_data')
            .upsert({
              user_id: user.id,
              device_name: 'Suunto',
              steps: workout.totalAscent ? null : null, // Suunto doesn't always provide steps
              calories_burned: workout.totalCalories || null,
              heart_rate: workout.avgHR || null,
              sleep_hours: null,
              data_date: dataDate,
            }, { onConflict: 'user_id,device_name,data_date' });
        }

        return new Response(
          JSON.stringify({ success: true, synced: workouts.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'disconnect': {
        // Remove stored tokens
        await supabaseAdmin
          .from('wearable_connections')
          .delete()
          .eq('user_id', user.id)
          .eq('provider', 'suunto');

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Suunto sync error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
