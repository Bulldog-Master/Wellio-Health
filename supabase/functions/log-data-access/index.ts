import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LogAccessRequest {
  clientId: string;
  accessType: 'fwi' | 'trends' | 'adherence' | 'summary' | 'messaging_metadata_free_view' | 'profile_view' | 'dashboard_view';
  role: 'supporter' | 'coach' | 'clinician';
  context?: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('[log-data-access] No authorization header');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's JWT
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Validate JWT and get user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[log-data-access] Invalid token:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { clientId, accessType, role, context }: LogAccessRequest = await req.json();

    // Validate required fields
    if (!clientId || !accessType || !role) {
      console.error('[log-data-access] Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: clientId, accessType, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent user from "logging" access on themselves as a viewer
    if (user.id === clientId) {
      console.warn('[log-data-access] Viewer and subject cannot be the same');
      return new Response(
        JSON.stringify({ error: 'Viewer and subject cannot be the same' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate access type
    const validAccessTypes = ['fwi', 'trends', 'adherence', 'summary', 'messaging_metadata_free_view', 'profile_view', 'dashboard_view'];
    if (!validAccessTypes.includes(accessType)) {
      console.error('[log-data-access] Invalid access type:', accessType);
      return new Response(
        JSON.stringify({ error: `Invalid access type. Must be one of: ${validAccessTypes.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate role
    const validRoles = ['supporter', 'coach', 'clinician'];
    if (!validRoles.includes(role)) {
      console.error('[log-data-access] Invalid role:', role);
      return new Response(
        JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the professional has an active relationship with the client
    let hasValidRelationship = false;
    
    if (role === 'coach') {
      const { data: coachRelation } = await supabaseAdmin
        .from('coach_clients')
        .select('id')
        .eq('coach_id', user.id)
        .eq('client_id', clientId)
        .eq('status', 'active')
        .single();
      hasValidRelationship = !!coachRelation;
    } else if (role === 'clinician') {
      const { data: clinicianRelation } = await supabaseAdmin
        .from('clinician_patients')
        .select('id')
        .eq('clinician_id', user.id)
        .eq('patient_id', clientId)
        .eq('status', 'active')
        .single();
      hasValidRelationship = !!clinicianRelation;
    } else if (role === 'supporter') {
      // For supporters, check close_friends or follows relationship
      const { data: supporterRelation } = await supabaseAdmin
        .from('close_friends')
        .select('id')
        .or(`and(user_id.eq.${clientId},friend_user_id.eq.${user.id}),and(user_id.eq.${user.id},friend_user_id.eq.${clientId})`)
        .single();
      hasValidRelationship = !!supporterRelation;
    }

    if (!hasValidRelationship) {
      console.warn('[log-data-access] No valid relationship found for viewer:', user.id, 'client:', clientId);
      // Still log the attempt but mark it in context
    }

    // Get user agent from request
    const userAgent = req.headers.get('user-agent') || null;

    // Insert the access log
    const { data: logEntry, error: insertError } = await supabaseAdmin
      .from('data_access_log')
      .insert({
        professional_id: user.id,
        client_id: clientId,
        access_type: accessType,
        role: role,
        context: {
          ...context,
          has_valid_relationship: hasValidRelationship,
          timestamp: new Date().toISOString(),
        },
        user_agent: userAgent,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[log-data-access] Insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to log data access' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[log-data-access] Successfully logged access:', {
      logId: logEntry.id,
      viewer: user.id,
      subject: clientId,
      accessType,
      role,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        logId: logEntry.id,
        message: 'Data access logged successfully' 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[log-data-access] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
