import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate admin user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user is admin
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { crypto_payment_id, action, tx_hash, notes } = await req.json();

    if (!crypto_payment_id || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing crypto verification: ${crypto_payment_id}, action: ${action}`);

    // Get the crypto payment
    const { data: cryptoPayment, error: fetchError } = await supabaseAdmin
      .from('crypto_payments')
      .select('*, payment_transactions(*)')
      .eq('id', crypto_payment_id)
      .single();

    if (fetchError || !cryptoPayment) {
      console.error('Crypto payment not found:', fetchError);
      return new Response(JSON.stringify({ error: 'Crypto payment not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newStatus = action === 'approve' ? 'confirmed' : 'failed';

    // Update crypto payment
    const { error: updateError } = await supabaseAdmin
      .from('crypto_payments')
      .update({
        status: newStatus,
        tx_hash: tx_hash || cryptoPayment.tx_hash,
      })
      .eq('id', crypto_payment_id);

    if (updateError) {
      console.error('Failed to update crypto payment:', updateError);
      throw updateError;
    }

    // Update the related payment transaction if exists
    if (cryptoPayment.transaction_id) {
      await supabaseAdmin
        .from('payment_transactions')
        .update({
          status: action === 'approve' ? 'completed' : 'failed',
          completed_at: action === 'approve' ? new Date().toISOString() : null,
        })
        .eq('id', cryptoPayment.transaction_id);

      // If approved, activate the subscription/addon
      if (action === 'approve' && cryptoPayment.payment_transactions) {
        const transaction = cryptoPayment.payment_transactions;
        
        if (transaction.transaction_type === 'subscription') {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              tier: transaction.metadata?.tier || 'pro',
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('user_id', cryptoPayment.user_id);
        } else if (transaction.transaction_type === 'addon') {
          await supabaseAdmin
            .from('user_addons')
            .upsert({
              user_id: cryptoPayment.user_id,
              addon_key: transaction.metadata?.addon_key,
              status: 'active',
              activated_at: new Date().toISOString(),
            });
        }
      }
    }

    console.log(`Crypto payment ${crypto_payment_id} ${newStatus} by admin ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: newStatus,
        message: `Crypto payment ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying crypto payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
