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

    const { etransfer_id, action, notes } = await req.json();

    if (!etransfer_id || !action) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processing e-transfer verification: ${etransfer_id}, action: ${action}`);

    // Get the e-transfer request
    const { data: etransfer, error: fetchError } = await supabaseAdmin
      .from('etransfer_requests')
      .select('*, payment_transactions(*)')
      .eq('id', etransfer_id)
      .single();

    if (fetchError || !etransfer) {
      console.error('E-transfer not found:', fetchError);
      return new Response(JSON.stringify({ error: 'E-transfer request not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newStatus = action === 'approve' ? 'verified' : 'rejected';

    // Update e-transfer request
    const { error: updateError } = await supabaseAdmin
      .from('etransfer_requests')
      .update({
        status: newStatus,
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        notes: notes || null,
      })
      .eq('id', etransfer_id);

    if (updateError) {
      console.error('Failed to update e-transfer:', updateError);
      throw updateError;
    }

    // Update the related payment transaction if exists
    if (etransfer.transaction_id) {
      await supabaseAdmin
        .from('payment_transactions')
        .update({
          status: action === 'approve' ? 'completed' : 'failed',
          completed_at: action === 'approve' ? new Date().toISOString() : null,
        })
        .eq('id', etransfer.transaction_id);

      // If approved, activate the subscription/addon
      if (action === 'approve' && etransfer.payment_transactions) {
        const transaction = etransfer.payment_transactions;
        
        if (transaction.transaction_type === 'subscription') {
          // Update user subscription
          await supabaseAdmin
            .from('subscriptions')
            .update({
              tier: transaction.metadata?.tier || 'pro',
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('user_id', etransfer.user_id);
        } else if (transaction.transaction_type === 'addon') {
          // Activate addon
          await supabaseAdmin
            .from('user_addons')
            .upsert({
              user_id: etransfer.user_id,
              addon_key: transaction.metadata?.addon_key,
              status: 'active',
              activated_at: new Date().toISOString(),
            });
        }
      }
    }

    console.log(`E-transfer ${etransfer_id} ${newStatus} by admin ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        status: newStatus,
        message: `E-transfer ${action === 'approve' ? 'approved' : 'rejected'} successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error verifying e-transfer:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
