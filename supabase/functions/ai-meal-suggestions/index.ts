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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user's nutrition history and goals
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('goal, weight, target_weight')
      .eq('id', user.id)
      .single();

    const { data: nutritionLogs } = await supabaseClient
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('logged_at', { ascending: false });

    // Calculate average daily macros
    const totalCalories = nutritionLogs?.reduce((sum, log) => sum + (log.calories || 0), 0) || 0;
    const totalProtein = nutritionLogs?.reduce((sum, log) => sum + (log.protein_grams || 0), 0) || 0;
    const totalCarbs = nutritionLogs?.reduce((sum, log) => sum + (log.carbs_grams || 0), 0) || 0;
    const totalFat = nutritionLogs?.reduce((sum, log) => sum + (log.fat_grams || 0), 0) || 0;
    const days = nutritionLogs?.length ? Math.min(7, new Set(nutritionLogs.map(l => l.logged_at?.split('T')[0])).size) : 1;

    const context = `
User Nutrition Profile:
- Goal: ${profile?.goal || 'Not specified'}
- Current Weight: ${profile?.weight || 'Not specified'} lbs
- Target Weight: ${profile?.target_weight || 'Not specified'} lbs

Recent Nutrition (last 7 days average):
- Calories: ${Math.round(totalCalories / days)} per day
- Protein: ${Math.round(totalProtein / days)}g per day
- Carbs: ${Math.round(totalCarbs / days)}g per day
- Fat: ${Math.round(totalFat / days)}g per day

Common foods eaten:
${nutritionLogs?.slice(0, 10).map(l => `- ${l.food_name}`).join('\n') || 'No recent meals logged'}

Based on this data, provide 5 meal suggestions that:
1. Align with their fitness goals (${profile?.goal})
2. Are balanced and nutritious
3. Offer variety from recent meals
4. Include approximate macros
5. Are practical to prepare

Format each suggestion as:
- Meal Name
- Meal Type (breakfast/lunch/dinner/snack)
- Estimated macros (calories, protein, carbs, fat)
- Brief preparation notes
- Why it's good for their goals
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
            content: 'You are a professional nutritionist providing personalized meal suggestions. Be specific, practical, and consider dietary balance.' 
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
    const suggestions = data.choices[0].message.content;

    // Store suggestions
    await supabaseClient
      .from('ai_insights')
      .insert({
        user_id: user.id,
        insight_type: 'meal_suggestions',
        insight_text: suggestions,
        data_summary: {
          profile,
          avg_daily_calories: Math.round(totalCalories / days),
          avg_daily_protein: Math.round(totalProtein / days),
          recent_meals: nutritionLogs?.length || 0
        }
      });

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-meal-suggestions:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
