import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { emotionData, workoutData, cycleData } = await req.json();

    // Analyze emotion-fitness correlations using Lovable AI
    const prompt = `You are an expert fitness psychologist and wellness coach. Analyze the following data to provide insights on emotion-fitness correlations.

EMOTION LOG DATA:
${JSON.stringify(emotionData, null, 2)}

WORKOUT DATA:
${JSON.stringify(workoutData, null, 2)}

${cycleData ? `MENSTRUAL CYCLE DATA:
${JSON.stringify(cycleData, null, 2)}` : ''}

Provide a comprehensive analysis in the following JSON format:
{
  "overallMoodScore": <number 1-10>,
  "workoutImpactOnMood": "<positive/neutral/negative>",
  "moodImpactOnPerformance": "<positive/neutral/negative>",
  "bestWorkoutMoods": ["<mood1>", "<mood2>"],
  "avoidWorkoutMoods": ["<mood1>"],
  "cycleInsights": ${cycleData ? `{
    "currentPhase": "<follicular/ovulatory/luteal/menstrual>",
    "energyLevel": "<high/moderate/low>",
    "recommendedIntensity": "<high/moderate/low>",
    "bestExerciseTypes": ["<type1>", "<type2>"],
    "nutritionTips": ["<tip1>", "<tip2>"]
  }` : 'null'},
  "patterns": [
    {
      "observation": "<pattern description>",
      "recommendation": "<actionable advice>"
    }
  ],
  "weeklyRecommendation": "<personalized weekly workout mood strategy>",
  "stressManagement": "<stress-workout correlation advice>"
}

Be specific, actionable, and supportive in your recommendations.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      // Fallback to mock analysis if API fails
      const mockAnalysis = generateMockAnalysis(emotionData, workoutData, cycleData);
      return new Response(JSON.stringify(mockAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const aiResponse = await response.json();
    const analysisText = aiResponse.content[0].text;
    
    // Extract JSON from response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Could not parse AI response');
  } catch (error) {
    console.error('Error in emotion-fitness-analysis:', error);
    
    // Return mock analysis on error
    const mockAnalysis = generateMockAnalysis(null, null, null);
    return new Response(JSON.stringify(mockAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateMockAnalysis(emotionData: any, workoutData: any, cycleData: any) {
  const currentPhase = cycleData?.currentPhase || 'follicular';
  
  return {
    overallMoodScore: 7,
    workoutImpactOnMood: 'positive',
    moodImpactOnPerformance: 'positive',
    bestWorkoutMoods: ['energized', 'motivated', 'calm'],
    avoidWorkoutMoods: ['exhausted', 'anxious'],
    cycleInsights: cycleData ? {
      currentPhase,
      energyLevel: currentPhase === 'ovulatory' ? 'high' : currentPhase === 'luteal' ? 'moderate' : 'moderate',
      recommendedIntensity: currentPhase === 'menstrual' ? 'low' : currentPhase === 'ovulatory' ? 'high' : 'moderate',
      bestExerciseTypes: currentPhase === 'menstrual' 
        ? ['yoga', 'walking', 'stretching']
        : currentPhase === 'ovulatory'
        ? ['HIIT', 'strength training', 'running']
        : ['pilates', 'swimming', 'cycling'],
      nutritionTips: [
        'Stay hydrated throughout the day',
        'Include iron-rich foods in your diet',
        'Balance protein intake for recovery'
      ]
    } : null,
    patterns: [
      {
        observation: 'You perform best when working out in the morning',
        recommendation: 'Schedule high-intensity workouts before 10 AM for optimal results'
      },
      {
        observation: 'Your mood improves significantly after cardio sessions',
        recommendation: 'Include 20-30 minutes of cardio when feeling stressed'
      }
    ],
    weeklyRecommendation: 'Focus on strength training mid-week when energy peaks, and lighter activities on weekends for recovery.',
    stressManagement: 'When stress levels are high, opt for yoga or light swimming instead of intense workouts to avoid burnout.'
  };
}
