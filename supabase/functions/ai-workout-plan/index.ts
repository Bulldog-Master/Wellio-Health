import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkoutPlanRequest {
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  daysPerWeek: number;
  equipment: string[];
  duration: number; // minutes per session
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { fitnessLevel, goals, daysPerWeek, equipment, duration }: WorkoutPlanRequest = await req.json();

    console.log(`Generating AI workout plan for user ${user.id}`, { fitnessLevel, goals, daysPerWeek, equipment, duration });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    let plan;
    
    if (LOVABLE_API_KEY) {
      // Use Lovable AI for personalized plan generation
      plan = await generateAIWorkoutPlan(LOVABLE_API_KEY, fitnessLevel, goals, daysPerWeek, equipment, duration);
    } else {
      // Fallback to rule-based generation
      console.log("LOVABLE_API_KEY not found, using rule-based generation");
      plan = generateRuleBasedPlan(fitnessLevel, goals, daysPerWeek, equipment, duration);
    }

    // Save the plan to database (if table exists)
    try {
      await supabaseAdmin
        .from('workout_plans')
        .insert({
          user_id: user.id,
          plan_data: plan,
          fitness_level: fitnessLevel,
          goals: goals,
          days_per_week: daysPerWeek,
          status: 'active'
        });
    } catch (insertError) {
      console.log('Note: workout_plans table may not exist, skipping save');
    }

    return new Response(JSON.stringify({ plan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Error generating workout plan:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function generateAIWorkoutPlan(
  apiKey: string,
  fitnessLevel: string,
  goals: string[],
  daysPerWeek: number,
  equipment: string[],
  duration: number
) {
  const systemPrompt = `You are an expert personal trainer and fitness program designer. Create personalized, effective workout plans based on the user's goals, fitness level, and available equipment.

Always respond with a valid JSON object in this exact format:
{
  "name": "string - creative plan name",
  "fitnessLevel": "string",
  "goals": ["array of goals"],
  "daysPerWeek": number,
  "weeklySchedule": [
    {
      "day": "Monday/Tuesday/etc",
      "focus": "string - muscle groups or workout type (e.g., PUSH, PULL, LEGS, FULL BODY)",
      "estimatedDuration": number (in minutes),
      "exercises": [
        {
          "name": "string",
          "sets": number,
          "reps": "string (e.g., '8-12' or '30 seconds')",
          "restSeconds": number
        }
      ]
    }
  ],
  "tips": ["array of 4 personalized tips for this plan"],
  "progressionGuide": "string - how to progress over 4-6 weeks",
  "nutritionAdvice": "string - brief nutrition guidance for the goals"
}

Key principles:
- Balance muscle groups appropriately
- Include compound movements for efficiency
- Scale difficulty to fitness level
- Consider available equipment
- Provide proper rest between training same muscle groups`;

  const userPrompt = `Create a ${daysPerWeek}-day per week workout plan with these specifications:

Fitness Level: ${fitnessLevel}
Goals: ${goals.join(', ')}
Available Equipment: ${equipment.length > 0 ? equipment.join(', ') : 'bodyweight only'}
Session Duration: ${duration} minutes

Design an effective program that maximizes results within the given time and equipment constraints.`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        throw new Error("AI credits exhausted. Please add credits.");
      }
      
      // Fallback to rule-based on API error
      console.log("Falling back to rule-based generation due to API error");
      return generateRuleBasedPlan(fitnessLevel, goals, daysPerWeek, equipment, duration);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response
    let plan;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                       content.match(/```\s*([\s\S]*?)\s*```/) ||
                       [null, content];
      const jsonString = jsonMatch[1] || content;
      plan = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response, using rule-based fallback");
      return generateRuleBasedPlan(fitnessLevel, goals, daysPerWeek, equipment, duration);
    }

    console.log("Successfully generated AI workout plan");
    return plan;

  } catch (error) {
    console.error("Error calling AI gateway:", error);
    return generateRuleBasedPlan(fitnessLevel, goals, daysPerWeek, equipment, duration);
  }
}

function generateRuleBasedPlan(
  fitnessLevel: string,
  goals: string[],
  daysPerWeek: number,
  equipment: string[],
  duration: number
) {
  const hasGym = equipment.includes('gym') || equipment.includes('full_gym');
  const hasDumbbells = equipment.includes('dumbbells') || hasGym;
  const hasBarbell = equipment.includes('barbell') || hasGym;
  const bodyweightOnly = equipment.length === 0 || equipment.includes('bodyweight');

  const exercises = {
    push: bodyweightOnly 
      ? ['Push-ups', 'Diamond Push-ups', 'Pike Push-ups', 'Dips']
      : hasDumbbells 
        ? ['Dumbbell Bench Press', 'Dumbbell Shoulder Press', 'Dumbbell Flyes', 'Tricep Extensions']
        : ['Barbell Bench Press', 'Overhead Press', 'Incline Press', 'Skull Crushers'],
    pull: bodyweightOnly
      ? ['Pull-ups', 'Chin-ups', 'Inverted Rows', 'Superman']
      : hasDumbbells
        ? ['Dumbbell Rows', 'Dumbbell Curls', 'Reverse Flyes', 'Hammer Curls']
        : ['Barbell Rows', 'Lat Pulldowns', 'Barbell Curls', 'Face Pulls'],
    legs: bodyweightOnly
      ? ['Squats', 'Lunges', 'Bulgarian Split Squats', 'Calf Raises', 'Glute Bridges']
      : hasDumbbells
        ? ['Goblet Squats', 'Dumbbell Lunges', 'Romanian Deadlifts', 'Calf Raises']
        : ['Barbell Squats', 'Deadlifts', 'Leg Press', 'Leg Curls'],
    core: ['Planks', 'Crunches', 'Russian Twists', 'Leg Raises', 'Mountain Climbers'],
    cardio: ['HIIT', 'Jump Rope', 'Burpees', 'High Knees', 'Running']
  };

  const repsPerSet = fitnessLevel === 'beginner' ? '8-10' : fitnessLevel === 'intermediate' ? '10-12' : '12-15';
  const sets = fitnessLevel === 'beginner' ? 3 : fitnessLevel === 'intermediate' ? 4 : 5;
  const restTime = fitnessLevel === 'beginner' ? 90 : fitnessLevel === 'intermediate' ? 60 : 45;

  const weeklySchedule: Array<{
    day: string;
    focus: string;
    estimatedDuration: number;
    exercises: Array<{
      name: string;
      sets: number;
      reps: string;
      restSeconds: number;
    }>;
  }> = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const workoutDays = [];
  if (daysPerWeek === 3) {
    workoutDays.push(0, 2, 4);
  } else if (daysPerWeek === 4) {
    workoutDays.push(0, 1, 3, 4);
  } else if (daysPerWeek === 5) {
    workoutDays.push(0, 1, 2, 3, 4);
  } else if (daysPerWeek === 6) {
    workoutDays.push(0, 1, 2, 3, 4, 5);
  } else {
    workoutDays.push(0, 2, 4);
  }

  const workoutTypes = goals.includes('muscle_gain') 
    ? ['push', 'pull', 'legs', 'push', 'pull', 'legs']
    : goals.includes('weight_loss')
      ? ['full_body', 'cardio', 'full_body', 'cardio', 'full_body', 'cardio']
      : ['push', 'pull', 'legs', 'core', 'cardio', 'full_body'];

  workoutDays.forEach((dayIndex, i) => {
    const workoutType = workoutTypes[i % workoutTypes.length];
    let dayExercises = [];

    if (workoutType === 'full_body') {
      dayExercises = [
        ...exercises.push.slice(0, 2),
        ...exercises.pull.slice(0, 2),
        ...exercises.legs.slice(0, 2),
        ...exercises.core.slice(0, 1)
      ];
    } else if (workoutType === 'cardio') {
      dayExercises = [
        ...exercises.cardio.slice(0, 3),
        ...exercises.core.slice(0, 2)
      ];
    } else {
      dayExercises = exercises[workoutType as keyof typeof exercises]?.slice(0, 4) || [];
    }

    weeklySchedule.push({
      day: dayNames[dayIndex],
      focus: workoutType.replace('_', ' ').toUpperCase(),
      estimatedDuration: duration,
      exercises: dayExercises.map(exercise => ({
        name: exercise,
        sets,
        reps: workoutType === 'cardio' ? '30-60 seconds' : repsPerSet,
        restSeconds: restTime
      }))
    });
  });

  return {
    name: `${fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1)} ${goals.join(' & ')} Plan`,
    fitnessLevel,
    goals,
    daysPerWeek,
    weeklySchedule,
    tips: [
      fitnessLevel === 'beginner' ? 'Focus on form over weight' : 'Progressive overload is key',
      'Stay hydrated throughout your workout',
      'Get 7-9 hours of sleep for optimal recovery',
      'Track your progress weekly'
    ]
  };
}
