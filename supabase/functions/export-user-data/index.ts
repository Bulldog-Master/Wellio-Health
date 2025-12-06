import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate user
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting data export for user: ${user.id}`);

    // Create export request record
    const { data: exportRequest, error: requestError } = await supabaseAdmin
      .from('data_export_requests')
      .insert({
        user_id: user.id,
        status: 'processing'
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating export request:', requestError);
      throw requestError;
    }

    // Collect all user data from various tables
    const exportData: Record<string, unknown> = {
      exportedAt: new Date().toISOString(),
      userId: user.id,
      email: user.email,
    };

    // Profile data
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profile) exportData.profile = profile;

    // Activity logs
    const { data: activityLogs } = await supabaseAdmin
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id);
    if (activityLogs?.length) exportData.activityLogs = activityLogs;

    // Nutrition logs
    const { data: nutritionLogs } = await supabaseAdmin
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id);
    if (nutritionLogs?.length) exportData.nutritionLogs = nutritionLogs;

    // Weight entries
    const { data: weightEntries } = await supabaseAdmin
      .from('weight_entries')
      .select('*')
      .eq('user_id', user.id);
    if (weightEntries?.length) exportData.weightEntries = weightEntries;

    // Step counts
    const { data: stepCounts } = await supabaseAdmin
      .from('step_counts')
      .select('*')
      .eq('user_id', user.id);
    if (stepCounts?.length) exportData.stepCounts = stepCounts;

    // Habits
    const { data: habits } = await supabaseAdmin
      .from('habits')
      .select('*')
      .eq('user_id', user.id);
    if (habits?.length) exportData.habits = habits;

    // Habit completions
    const { data: habitCompletions } = await supabaseAdmin
      .from('habit_completions')
      .select('*')
      .eq('user_id', user.id);
    if (habitCompletions?.length) exportData.habitCompletions = habitCompletions;

    // Body measurements
    const { data: bodyMeasurements } = await supabaseAdmin
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id);
    if (bodyMeasurements?.length) exportData.bodyMeasurements = bodyMeasurements;

    // Personal records
    const { data: personalRecords } = await supabaseAdmin
      .from('personal_records')
      .select('*')
      .eq('user_id', user.id);
    if (personalRecords?.length) exportData.personalRecords = personalRecords;

    // Posts
    const { data: posts } = await supabaseAdmin
      .from('posts')
      .select('*')
      .eq('user_id', user.id);
    if (posts?.length) exportData.posts = posts;

    // Comments
    const { data: comments } = await supabaseAdmin
      .from('comments')
      .select('*')
      .eq('user_id', user.id);
    if (comments?.length) exportData.comments = comments;

    // Achievements
    const { data: achievements } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('user_id', user.id);
    if (achievements?.length) exportData.achievements = achievements;

    // AI Insights
    const { data: aiInsights } = await supabaseAdmin
      .from('ai_insights')
      .select('*')
      .eq('user_id', user.id);
    if (aiInsights?.length) exportData.aiInsights = aiInsights;

    // Fitness events
    const { data: fitnessEvents } = await supabaseAdmin
      .from('fitness_events')
      .select('*')
      .eq('user_id', user.id);
    if (fitnessEvents?.length) exportData.fitnessEvents = fitnessEvents;

    // Meal plans
    const { data: mealPlans } = await supabaseAdmin
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id);
    if (mealPlans?.length) exportData.mealPlans = mealPlans;

    // Medications (without sensitive encryption data)
    const { data: medications } = await supabaseAdmin
      .from('medications')
      .select('id, medication_name, dosage, frequency, start_date, end_date, is_active, notes, created_at')
      .eq('user_id', user.id);
    if (medications?.length) exportData.medications = medications;

    // Privacy preferences
    const { data: privacyPrefs } = await supabaseAdmin
      .from('user_privacy_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (privacyPrefs) exportData.privacyPreferences = privacyPrefs;

    // User consents
    const { data: consents } = await supabaseAdmin
      .from('user_consents')
      .select('*')
      .eq('user_id', user.id);
    if (consents?.length) exportData.consents = consents;

    // Follows
    const { data: follows } = await supabaseAdmin
      .from('follows')
      .select('*')
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);
    if (follows?.length) exportData.socialConnections = follows;

    // Subscriptions
    const { data: subscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('tier, status, current_period_start, current_period_end, created_at')
      .eq('user_id', user.id);
    if (subscriptions?.length) exportData.subscriptions = subscriptions;

    // Convert to JSON string
    const exportJson = JSON.stringify(exportData, null, 2);
    const exportBlob = new Blob([exportJson], { type: 'application/json' });

    // Update export request as completed
    await supabaseAdmin
      .from('data_export_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .eq('id', exportRequest.id);

    console.log(`Data export completed for user: ${user.id}`);

    return new Response(exportJson, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="user-data-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error exporting user data:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to export user data', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
