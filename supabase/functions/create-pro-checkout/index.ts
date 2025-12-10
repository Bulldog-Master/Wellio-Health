import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Professional tier price mapping - will be populated with actual Stripe price IDs
const TIER_PRICES: Record<string, { monthly: string; yearly: string }> = {
  coach_pro: {
    monthly: Deno.env.get('STRIPE_PRICE_COACH_PRO_MONTHLY') || '',
    yearly: Deno.env.get('STRIPE_PRICE_COACH_PRO_YEARLY') || '',
  },
  coach_team: {
    monthly: Deno.env.get('STRIPE_PRICE_COACH_TEAM_MONTHLY') || '',
    yearly: Deno.env.get('STRIPE_PRICE_COACH_TEAM_YEARLY') || '',
  },
  clinician_practice: {
    monthly: Deno.env.get('STRIPE_PRICE_CLINICIAN_PRACTICE_MONTHLY') || '',
    yearly: Deno.env.get('STRIPE_PRICE_CLINICIAN_PRACTICE_YEARLY') || '',
  },
  clinician_enterprise: {
    monthly: Deno.env.get('STRIPE_PRICE_CLINICIAN_ENTERPRISE_MONTHLY') || '',
    yearly: Deno.env.get('STRIPE_PRICE_CLINICIAN_ENTERPRISE_YEARLY') || '',
  },
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { tier, billing_period = 'monthly' } = await req.json();
    
    if (!tier || !TIER_PRICES[tier]) {
      console.error('Invalid tier:', tier);
      return new Response(
        JSON.stringify({ error: 'Invalid tier' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const priceId = TIER_PRICES[tier][billing_period as 'monthly' | 'yearly'];
    
    if (!priceId) {
      console.error('Price ID not configured for tier:', tier, billing_period);
      return new Response(
        JSON.stringify({ error: 'Stripe not configured for this tier. Please contact support.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if Stripe is configured
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('Stripe secret key not configured');
      return new Response(
        JSON.stringify({ error: 'Payment processing not configured. Please contact support.' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Stripe checkout session
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'customer_email': user.email || '',
        'line_items[0][price]': priceId,
        'line_items[0][quantity]': '1',
        'success_url': `${Deno.env.get('SITE_URL') || 'https://wellio.app'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
        'cancel_url': `${Deno.env.get('SITE_URL') || 'https://wellio.app'}/billing/cancel`,
        'metadata[wellio_user_id]': user.id,
        'metadata[tier]': tier,
        'metadata[billing_period]': billing_period,
      }),
    });

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text();
      console.error('Stripe API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const session = await stripeResponse.json();
    
    console.log('Checkout session created:', session.id, 'for user:', user.id, 'tier:', tier);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
