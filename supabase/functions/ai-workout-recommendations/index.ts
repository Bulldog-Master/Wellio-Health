import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authHeader = req.headers.get('Authorization');
    
    if (!serviceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
    }

    // Create admin client to verify the JWT
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // Extract JWT from Authorization header
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'No authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (!user || userError) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create a client for data access
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader! },
        },
      }
    );

    // Fetch user's workout history, fitness goals, and profile
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('fitness_level, goal, exercise_goal')
      .eq('id', user.id)
      .single();

    const { data: workouts } = await supabaseClient
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(10);

    const { data: personalRecords } = await supabaseClient
      .from('personal_records')
      .select('exercise_name, record_value, record_unit')
      .eq('user_id', user.id)
      .limit(5);

    // Prepare context for AI
    const context = `
User Fitness Profile:
- Fitness Level: ${profile?.fitness_level || 'Not specified'}
- Goal: ${profile?.goal || 'Not specified'}
- Weekly Exercise Goal: ${profile?.exercise_goal || 'Not specified'} minutes

Recent Workouts (last 10):
${workouts?.map(w => `- ${w.activity_type}: ${w.duration_minutes} min, ${w.calories_burned || 0} cal`).join('\n') || 'No recent workouts'}

Personal Records:
${personalRecords?.map(pr => `- ${pr.exercise_name}: ${pr.record_value} ${pr.record_unit}`).join('\n') || 'No personal records yet'}

Based on this data, provide 3-5 specific workout recommendations that:
1. Match the user's fitness level and goals
2. Build on their recent activity patterns
3. Challenge them appropriately
4. Include variety to prevent boredom
5. Are achievable and motivating

Format each recommendation as:
- Workout Name
- Duration
- Difficulty
- Description (2-3 sentences)
- Expected benefits
`;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are a professional fitness coach providing personalized workout recommendations. Be specific, motivating, and practical.' 
          },
          { role: 'user', content: context }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const recommendations = data.choices[0].message.content;

    // Store recommendations
    await supabaseClient
      .from('ai_insights')
      .insert({
        user_id: user.id,
        insight_type: 'workout_recommendations',
        insight_text: recommendations,
        data_summary: {
          profile,
          recent_workouts: workouts?.length || 0,
          personal_records: personalRecords?.length || 0
        }
      });

    return new Response(
      JSON.stringify({ recommendations }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-workout-recommendations:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
