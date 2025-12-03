import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Garmin uses OAuth 1.0a
const GARMIN_REQUEST_TOKEN_URL = 'https://connectapi.garmin.com/oauth-service/oauth/request_token';
const GARMIN_AUTH_URL = 'https://connect.garmin.com/oauthConfirm';
const GARMIN_ACCESS_TOKEN_URL = 'https://connectapi.garmin.com/oauth-service/oauth/access_token';
const GARMIN_API_BASE = 'https://apis.garmin.com/wellness-api/rest';

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

// OAuth 1.0a signature generation
function generateOAuthSignature(
  method: string,
  url: string,
  params: Record<string, string>,
  consumerSecret: string,
  tokenSecret: string = ''
): string {
  const sortedParams = Object.keys(params).sort().map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  const signatureBaseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  const hmac = createHmac('sha1', signingKey);
  return hmac.update(signatureBaseString).digest('base64');
}

function generateOAuthHeader(method: string, url: string, consumerKey: string, consumerSecret: string, token?: string, tokenSecret?: string, verifier?: string): string {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ''),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_version: '1.0',
  };

  if (token) oauthParams.oauth_token = token;
  if (verifier) oauthParams.oauth_verifier = verifier;

  const signature = generateOAuthSignature(method, url, oauthParams, consumerSecret, tokenSecret || '');
  oauthParams.oauth_signature = signature;

  return 'OAuth ' + Object.keys(oauthParams).sort().map(k => `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`).join(', ');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const garminConsumerKey = Deno.env.get('GARMIN_CONSUMER_KEY');
    const garminConsumerSecret = Deno.env.get('GARMIN_CONSUMER_SECRET');
    const encryptionKey = Deno.env.get('DATA_ENCRYPTION_KEY');

    if (!garminConsumerKey || !garminConsumerSecret) {
      return new Response(
        JSON.stringify({ error: 'Garmin integration not configured', message: 'GARMIN_CONSUMER_KEY and GARMIN_CONSUMER_SECRET must be set' }),
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

    const { action, oauthToken, oauthVerifier, redirectUri } = await req.json();

    switch (action) {
      case 'get_request_token': {
        // Step 1: Get request token (OAuth 1.0a)
        const oauthHeader = generateOAuthHeader('POST', GARMIN_REQUEST_TOKEN_URL, garminConsumerKey, garminConsumerSecret);
        
        const response = await fetch(GARMIN_REQUEST_TOKEN_URL, {
          method: 'POST',
          headers: { 'Authorization': oauthHeader },
        });

        if (!response.ok) {
          console.error('Garmin request token failed:', await response.text());
          return new Response(JSON.stringify({ error: 'Failed to get request token' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const responseText = await response.text();
        const params = new URLSearchParams(responseText);
        const requestToken = params.get('oauth_token');
        const requestTokenSecret = params.get('oauth_token_secret');

        // Store request token secret temporarily (encrypted)
        const encryptedSecret = await encryptData(requestTokenSecret!, encryptionKey);
        await supabaseAdmin.from('wearable_connections').upsert({
          user_id: user.id,
          provider: 'garmin_temp',
          access_token_encrypted: encryptedSecret,
          encryption_version: 1,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,provider' });

        const authUrl = `${GARMIN_AUTH_URL}?oauth_token=${requestToken}`;
        return new Response(JSON.stringify({ authUrl, requestToken }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'exchange_token': {
        // Step 2: Exchange for access token
        const { data: tempConnection } = await supabaseAdmin
          .from('wearable_connections')
          .select('access_token_encrypted')
          .eq('user_id', user.id)
          .eq('provider', 'garmin_temp')
          .single();

        if (!tempConnection) {
          return new Response(JSON.stringify({ error: 'Request token not found' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const requestTokenSecret = await decryptData(tempConnection.access_token_encrypted, encryptionKey);
        const oauthHeader = generateOAuthHeader('POST', GARMIN_ACCESS_TOKEN_URL, garminConsumerKey, garminConsumerSecret, oauthToken, requestTokenSecret, oauthVerifier);

        const response = await fetch(GARMIN_ACCESS_TOKEN_URL, {
          method: 'POST',
          headers: { 'Authorization': oauthHeader },
        });

        if (!response.ok) {
          console.error('Garmin access token failed:', await response.text());
          return new Response(JSON.stringify({ error: 'Failed to exchange token' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const responseText = await response.text();
        const params = new URLSearchParams(responseText);
        const accessToken = params.get('oauth_token');
        const accessTokenSecret = params.get('oauth_token_secret');

        // Store encrypted tokens
        const encryptedAccessToken = await encryptData(accessToken!, encryptionKey);
        const encryptedAccessTokenSecret = await encryptData(accessTokenSecret!, encryptionKey);

        await supabaseAdmin.from('wearable_connections').upsert({
          user_id: user.id,
          provider: 'garmin',
          access_token_encrypted: encryptedAccessToken,
          refresh_token_encrypted: encryptedAccessTokenSecret, // Store token secret as refresh token
          encryption_version: 1,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,provider' });

        // Clean up temp token
        await supabaseAdmin.from('wearable_connections').delete().eq('user_id', user.id).eq('provider', 'garmin_temp');

        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'sync_workouts': {
        const { data: connection, error: connError } = await supabaseAdmin
          .from('wearable_connections')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'garmin')
          .single();

        if (connError || !connection) {
          return new Response(JSON.stringify({ error: 'Garmin not connected' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        let accessToken: string, accessTokenSecret: string;
        try {
          accessToken = await decryptData(connection.access_token_encrypted, encryptionKey);
          accessTokenSecret = await decryptData(connection.refresh_token_encrypted, encryptionKey);
        } catch {
          return new Response(JSON.stringify({ error: 'Failed to decrypt credentials', needsReauth: true }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Fetch daily summaries
        const today = new Date().toISOString().split('T')[0];
        const summaryUrl = `${GARMIN_API_BASE}/dailies?uploadStartTimeInSeconds=${Math.floor(Date.now() / 1000) - 86400}&uploadEndTimeInSeconds=${Math.floor(Date.now() / 1000)}`;
        
        const oauthHeader = generateOAuthHeader('GET', summaryUrl, garminConsumerKey, garminConsumerSecret, accessToken, accessTokenSecret);
        
        const response = await fetch(summaryUrl, {
          headers: { 'Authorization': oauthHeader },
        });

        if (!response.ok) {
          console.error('Garmin sync failed:', await response.text());
          return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const data = await response.json();
        const summaries = Array.isArray(data) ? data : [data];

        for (const summary of summaries) {
          await supabaseAdmin.from('wearable_data').upsert({
            user_id: user.id,
            device_name: 'Garmin',
            steps: summary.steps || null,
            calories_burned: summary.activeKilocalories || null,
            heart_rate: summary.restingHeartRateInBeatsPerMinute || null,
            sleep_hours: summary.sleepDurationInSeconds ? summary.sleepDurationInSeconds / 3600 : null,
            data_date: today,
          }, { onConflict: 'user_id,device_name,data_date' });
        }

        return new Response(JSON.stringify({ success: true, synced: summaries.length }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'disconnect': {
        await supabaseAdmin.from('wearable_connections').delete().eq('user_id', user.id).eq('provider', 'garmin');
        await supabaseAdmin.from('wearable_connections').delete().eq('user_id', user.id).eq('provider', 'garmin_temp');
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  } catch (error) {
    console.error('Garmin sync error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
