import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

// Tier mapping from Stripe price IDs to internal tier names
const PRICE_TO_TIER: Record<string, { tier: string; type: 'coach' | 'clinician' }> = {
  // These will be populated with actual Stripe price IDs
  // Coach tiers
  [Deno.env.get('STRIPE_PRICE_COACH_PRO_MONTHLY') || 'price_coach_pro_monthly']: { tier: 'coach_pro', type: 'coach' },
  [Deno.env.get('STRIPE_PRICE_COACH_PRO_YEARLY') || 'price_coach_pro_yearly']: { tier: 'coach_pro', type: 'coach' },
  [Deno.env.get('STRIPE_PRICE_COACH_TEAM_MONTHLY') || 'price_coach_team_monthly']: { tier: 'coach_team', type: 'coach' },
  [Deno.env.get('STRIPE_PRICE_COACH_TEAM_YEARLY') || 'price_coach_team_yearly']: { tier: 'coach_team', type: 'coach' },
  // Clinician tiers
  [Deno.env.get('STRIPE_PRICE_CLINICIAN_PRACTICE_MONTHLY') || 'price_clinician_practice_monthly']: { tier: 'clinician_practice', type: 'clinician' },
  [Deno.env.get('STRIPE_PRICE_CLINICIAN_PRACTICE_YEARLY') || 'price_clinician_practice_yearly']: { tier: 'clinician_practice', type: 'clinician' },
  [Deno.env.get('STRIPE_PRICE_CLINICIAN_ENTERPRISE_MONTHLY') || 'price_clinician_enterprise_monthly']: { tier: 'clinician_enterprise', type: 'clinician' },
  [Deno.env.get('STRIPE_PRICE_CLINICIAN_ENTERPRISE_YEARLY') || 'price_clinician_enterprise_yearly']: { tier: 'clinician_enterprise', type: 'clinician' },
};

async function verifyStripeSignature(payload: string, signature: string): Promise<boolean> {
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return false;
  }

  try {
    // Simple signature verification (in production, use stripe library)
    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
    const v1Signature = parts.find(p => p.startsWith('v1='))?.split('=')[1];

    if (!timestamp || !v1Signature) {
      return false;
    }

    // Verify timestamp is within 5 minutes
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - parseInt(timestamp)) > 300) {
      console.error('Webhook timestamp too old');
      return false;
    }

    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return computedSignature === v1Signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const payload = await req.text();

    // Verify signature in production
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (webhookSecret && signature) {
      const isValid = await verifyStripeSignature(payload, signature);
      if (!isValid) {
        console.error('Invalid webhook signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const event = JSON.parse(payload);
    console.log('Stripe webhook event:', event.type, event.id);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.wellio_user_id;
        const tier = session.metadata?.tier;

        if (!userId || !tier) {
          console.error('Missing metadata in checkout session');
          break;
        }

        // Get subscription details
        const subscriptionId = session.subscription;
        const customerId = session.customer;

        // Determine professional type from tier
        const professionalType = tier.startsWith('coach') ? 'coach' : 'clinician';

        // Upsert professional subscription
        const { error } = await supabaseAdmin
          .from('professional_subscriptions')
          .upsert({
            user_id: userId,
            professional_type: professionalType,
            tier: tier,
            status: 'active',
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            current_period_start: new Date().toISOString(),
          }, {
            onConflict: 'user_id,professional_type'
          });

        if (error) {
          console.error('Error upserting professional subscription:', error);
        } else {
          console.log('Professional subscription activated:', userId, tier);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;

        // Find subscription by Stripe subscription ID
        const { data: existingSub } = await supabaseAdmin
          .from('professional_subscriptions')
          .select('*')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!existingSub) {
          console.log('No matching professional subscription found for:', subscriptionId);
          break;
        }

        // Get new tier from price ID
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const tierInfo = priceId ? PRICE_TO_TIER[priceId] : null;

        // Update subscription
        const { error } = await supabaseAdmin
          .from('professional_subscriptions')
          .update({
            status: subscription.status === 'active' ? 'active' : 
                   subscription.status === 'past_due' ? 'past_due' : 
                   subscription.status === 'trialing' ? 'trialing' : 'canceled',
            tier: tierInfo?.tier || existingSub.tier,
            current_period_start: subscription.current_period_start 
              ? new Date(subscription.current_period_start * 1000).toISOString() 
              : existingSub.current_period_start,
            current_period_end: subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000).toISOString() 
              : existingSub.current_period_end,
            cancel_at_period_end: subscription.cancel_at_period_end || false,
          })
          .eq('id', existingSub.id);

        if (error) {
          console.error('Error updating professional subscription:', error);
        } else {
          console.log('Professional subscription updated:', existingSub.user_id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;

        const { error } = await supabaseAdmin
          .from('professional_subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscriptionId);

        if (error) {
          console.error('Error canceling professional subscription:', error);
        } else {
          console.log('Professional subscription canceled:', subscriptionId);
        }
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
