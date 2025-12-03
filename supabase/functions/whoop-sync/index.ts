import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WHOOP API endpoints
const WHOOP_AUTH_URL = 'https://api.prod.whoop.com/oauth/oauth2/auth';
const WHOOP_TOKEN_URL = 'https://api.prod.whoop.com/oauth/oauth2/token';
const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v1';

// ============= Encryption Utilities =============
const importKey = async (keyBase64: string): Promise<CryptoKey> => {
  const keyData = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
  return crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
};

const encryptData = async (data: string, keyBase64: string): Promise<string> => {
  const key = await importKey(keyBase64);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(data));
  const combined = new Uint8Array(iv.length + new Uint8Array(encrypted).length);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);
  return btoa(String.fromCharCode(...combined));
};

const decryptData = async (encryptedBase64: string, keyBase64: string): Promise<string> => {
  const key = await importKey(keyBase64);
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encryptedData);
  return new TextDecoder().decode(decrypted);
};
// ============= End Encryption Utilities =============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const whoopClientId = Deno.env.get('WHOOP_CLIENT_ID');
    const whoopClientSecret = Deno.env.get('WHOOP_CLIENT_SECRET');
    const encryptionKey = Deno.env.get('DATA_ENCRYPTION_KEY');

    if (!whoopClientId || !whoopClientSecret) {
      return new Response(
        JSON.stringify({ error: 'WHOOP integration not configured', message: 'WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET must be set' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!encryptionKey) {
      return new Response(JSON.stringify({ error: 'Encryption not configured' }), { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { action, code, redirectUri } = await req.json();

    switch (action) {
      case 'get_auth_url': {
        const state = crypto.randomUUID();
        const scope = 'read:recovery read:cycles read:sleep read:workout read:profile read:body_measurement';
        const authUrl = `${WHOOP_AUTH_URL}?client_id=${whoopClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`;
        return new Response(JSON.stringify({ authUrl, state }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'exchange_token': {
        const tokenResponse = await fetch(WHOOP_TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: whoopClientId,
            client_secret: whoopClientSecret,
          }),
        });

        if (!tokenResponse.ok) {
          console.error('WHOOP token exchange failed:', await tokenResponse.text());
          return new Response(JSON.stringify({ error: 'Failed to exchange token' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const tokenData = await tokenResponse.json();
        const encryptedAccessToken = await encryptData(tokenData.access_token, encryptionKey);
        const encryptedRefreshToken = tokenData.refresh_token ? await encryptData(tokenData.refresh_token, encryptionKey) : null;

        const { error: upsertError } = await supabaseAdmin
          .from('wearable_connections')
          .upsert({
            user_id: user.id,
            provider: 'whoop',
            access_token_encrypted: encryptedAccessToken,
            refresh_token_encrypted: encryptedRefreshToken,
            encryption_version: 1,
            expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id,provider' });

        if (upsertError) {
          console.error('Error storing WHOOP tokens:', upsertError);
          return new Response(JSON.stringify({ error: 'Failed to store tokens' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'sync_workouts': {
        const { data: connection, error: connError } = await supabaseAdmin
          .from('wearable_connections')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'whoop')
          .single();

        if (connError || !connection) {
          return new Response(JSON.stringify({ error: 'WHOOP not connected' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        let accessToken: string;
        try {
          accessToken = connection.access_token_encrypted
            ? await decryptData(connection.access_token_encrypted, encryptionKey)
            : connection.access_token;
        } catch {
          return new Response(JSON.stringify({ error: 'Failed to decrypt credentials', needsReauth: true }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Check token expiry and refresh
        if (new Date(connection.expires_at) < new Date()) {
          let refreshToken: string;
          try {
            refreshToken = connection.refresh_token_encrypted
              ? await decryptData(connection.refresh_token_encrypted, encryptionKey)
              : connection.refresh_token;
          } catch {
            return new Response(JSON.stringify({ error: 'Failed to refresh token', needsReauth: true }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          const refreshResponse = await fetch(WHOOP_TOKEN_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
              client_id: whoopClientId,
              client_secret: whoopClientSecret,
            }),
          });

          if (!refreshResponse.ok) {
            return new Response(JSON.stringify({ error: 'Failed to refresh token', needsReauth: true }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }

          const refreshData = await refreshResponse.json();
          accessToken = refreshData.access_token;

          await supabaseAdmin.from('wearable_connections').update({
            access_token_encrypted: await encryptData(refreshData.access_token, encryptionKey),
            refresh_token_encrypted: refreshData.refresh_token ? await encryptData(refreshData.refresh_token, encryptionKey) : connection.refresh_token_encrypted,
            encryption_version: 1,
            expires_at: new Date(Date.now() + refreshData.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id).eq('provider', 'whoop');
        }

        // Fetch recovery and cycle data
        const recoveryUrl = `${WHOOP_API_BASE}/recovery`;
        const recoveryResponse = await fetch(recoveryUrl, {
          headers: { 'Authorization': `Bearer ${accessToken}` },
        });

        if (!recoveryResponse.ok) {
          console.error('WHOOP recovery fetch failed:', await recoveryResponse.text());
          return new Response(JSON.stringify({ error: 'Failed to fetch recovery data' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const recoveryData = await recoveryResponse.json();
        const records = recoveryData.records || [];
        const today = new Date().toISOString().split('T')[0];

        for (const record of records.slice(0, 7)) {
          const score = record.score || {};
          await supabaseAdmin.from('wearable_data').upsert({
            user_id: user.id,
            device_name: 'WHOOP',
            steps: null,
            calories_burned: score.kilojoules ? Math.round(score.kilojoules / 4.184) : null,
            heart_rate: score.resting_heart_rate || null,
            sleep_hours: score.sleep_performance_percentage ? score.sleep_performance_percentage / 10 : null,
            data_date: record.created_at?.split('T')[0] || today,
          }, { onConflict: 'user_id,device_name,data_date' });
        }

        return new Response(JSON.stringify({ success: true, synced: records.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'disconnect': {
        await supabaseAdmin.from('wearable_connections').delete().eq('user_id', user.id).eq('provider', 'whoop');
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('WHOOP sync error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
