import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Authenticated user:', user.id);

    const { sleepData, workoutHistory, preferences } = await req.json();
    
    console.log('Analyzing circadian rhythm for user:', user.id, { 
      sleepEntries: sleepData?.length || 0,
      workoutEntries: workoutHistory?.length || 0 
    });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.log('No API key, returning mock analysis');
      return new Response(JSON.stringify(generateMockAnalysis(sleepData, workoutHistory)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Analyze this user's sleep and workout data to optimize their circadian rhythm for fitness:

Sleep Data (recent entries):
${JSON.stringify(sleepData || [], null, 2)}

Workout History (recent entries):
${JSON.stringify(workoutHistory || [], null, 2)}

User Preferences:
${JSON.stringify(preferences || {}, null, 2)}

Provide a JSON response with:
1. chronotype: "early_bird" | "night_owl" | "intermediate"
2. optimalWorkoutWindows: array of { startHour: number, endHour: number, intensity: "high" | "moderate" | "low", reason: string }
3. sleepQualityScore: number 1-100
4. recommendations: array of specific actionable recommendations
5. peakEnergyHours: array of hours (0-23) when energy is highest
6. avoidExerciseHours: array of hours to avoid intense exercise
7. weeklyScheduleSuggestion: object with days and recommended workout types/times`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a circadian rhythm and sleep science expert. Analyze sleep and workout patterns to provide personalized optimization recommendations. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return new Response(JSON.stringify(generateMockAnalysis(sleepData, workoutHistory)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : generateMockAnalysis(sleepData, workoutHistory);
    } catch {
      console.error('Failed to parse AI response');
      analysis = generateMockAnalysis(sleepData, workoutHistory);
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in circadian-optimizer:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateMockAnalysis(sleepData: any, workoutHistory: any) {
  return {
    chronotype: "intermediate",
    optimalWorkoutWindows: [
      { startHour: 7, endHour: 9, intensity: "high", reason: "Peak cortisol and testosterone levels" },
      { startHour: 16, endHour: 18, intensity: "high", reason: "Body temperature and muscle function peak" },
      { startHour: 12, endHour: 13, intensity: "moderate", reason: "Good for maintaining activity levels" }
    ],
    sleepQualityScore: 72,
    recommendations: [
      "Aim for consistent sleep and wake times, even on weekends",
      "Avoid intense workouts within 3 hours of bedtime",
      "Morning sunlight exposure helps regulate your circadian rhythm",
      "Consider a short afternoon workout to boost evening alertness",
      "Limit caffeine after 2 PM for better sleep quality"
    ],
    peakEnergyHours: [8, 9, 10, 16, 17],
    avoidExerciseHours: [22, 23, 0, 1, 2, 3, 4, 5],
    weeklyScheduleSuggestion: {
      monday: { time: "07:00", type: "Strength Training", duration: 60 },
      tuesday: { time: "17:00", type: "Cardio", duration: 45 },
      wednesday: { time: "07:00", type: "HIIT", duration: 30 },
      thursday: { time: "12:00", type: "Yoga/Stretching", duration: 30 },
      friday: { time: "16:30", type: "Strength Training", duration: 60 },
      saturday: { time: "09:00", type: "Long Cardio", duration: 60 },
      sunday: { time: "10:00", type: "Active Recovery", duration: 30 }
    }
  };
}
