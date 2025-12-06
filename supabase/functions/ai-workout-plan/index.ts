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

    console.log(`Generating workout plan for user ${user.id}`, { fitnessLevel, goals, daysPerWeek });

    // Generate workout plan based on parameters
    const plan = generateWorkoutPlan(fitnessLevel, goals, daysPerWeek, equipment, duration);

    // Save the plan to database
    const { error: insertError } = await supabaseAdmin
      .from('workout_plans')
      .insert({
        user_id: user.id,
        plan_data: plan,
        fitness_level: fitnessLevel,
        goals: goals,
        days_per_week: daysPerWeek,
        status: 'active'
      });

    if (insertError) {
      console.error('Error saving workout plan:', insertError);
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

function generateWorkoutPlan(
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

  // Create workout schedule based on days per week
  const workoutDays = [];
  if (daysPerWeek === 3) {
    workoutDays.push(0, 2, 4); // Mon, Wed, Fri
  } else if (daysPerWeek === 4) {
    workoutDays.push(0, 1, 3, 4); // Mon, Tue, Thu, Fri
  } else if (daysPerWeek === 5) {
    workoutDays.push(0, 1, 2, 3, 4); // Mon-Fri
  } else if (daysPerWeek === 6) {
    workoutDays.push(0, 1, 2, 3, 4, 5); // Mon-Sat
  } else {
    workoutDays.push(0, 2, 4); // Default to 3 days
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
