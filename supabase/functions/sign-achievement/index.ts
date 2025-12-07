import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { achievementId, achievementType, value, unit, achievedAt } = await req.json();

    if (!achievementId || !achievementType || value === undefined) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create achievement data payload
    const achievementData = {
      id: achievementId,
      userId: user.id,
      type: achievementType,
      value: value,
      unit: unit || '',
      achievedAt: achievedAt || new Date().toISOString(),
      timestamp: Date.now(),
    };

    // Create a deterministic signature using HMAC-SHA256
    const signingKey = Deno.env.get('DATA_ENCRYPTION_KEY') || 'default-signing-key';
    const encoder = new TextEncoder();
    const data = encoder.encode(JSON.stringify(achievementData));
    
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(signingKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, data);
    const signatureHex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Create verification hash (public identifier)
    const verificationHash = signatureHex.substring(0, 16).toUpperCase();

    // Generate shareable badge data
    const badge = {
      achievement: {
        type: achievementType,
        value: value,
        unit: unit,
        achievedAt: achievementData.achievedAt,
      },
      verification: {
        hash: verificationHash,
        signedAt: new Date().toISOString(),
        platform: 'Wellio',
        version: '1.0',
      },
      shareUrl: `https://wellio.lovable.app/verify/${verificationHash}`,
    };

    console.log('Achievement signed successfully:', { achievementId, verificationHash });

    return new Response(JSON.stringify({
      success: true,
      badge,
      signature: signatureHex,
      verificationHash,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Sign achievement error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to sign achievement' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});