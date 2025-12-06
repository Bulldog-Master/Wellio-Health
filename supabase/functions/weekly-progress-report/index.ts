import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get date range for last week
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    // Fetch all relevant data in parallel
    const [
      workoutsResult,
      nutritionResult,
      weightResult,
      stepsResult,
      sleepResult,
    ] = await Promise.all([
      supabase
        .from("activity_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", startStr)
        .lte("logged_at", endStr),
      supabase
        .from("nutrition_logs")
        .select("*")
        .eq("user_id", user.id)
        .gte("logged_at", startStr)
        .lte("logged_at", endStr),
      supabase
        .from("body_measurements")
        .select("*")
        .eq("user_id", user.id)
        .gte("measured_at", startStr)
        .lte("measured_at", endStr)
        .order("measured_at", { ascending: false }),
      supabase
        .from("leaderboard_entries")
        .select("*")
        .eq("user_id", user.id)
        .eq("leaderboard_type", "steps")
        .gte("period_start", startStr)
        .lte("period_end", endStr),
      supabase
        .from("fitness_events")
        .select("*")
        .eq("user_id", user.id)
        .eq("event_type", "sleep")
        .gte("start_time", startStr)
        .lte("start_time", endStr),
    ]);

    // Calculate workout stats
    const workouts = workoutsResult.data || [];
    const totalWorkouts = workouts.length;
    const totalWorkoutMinutes = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0);
    const totalCaloriesBurned = workouts.reduce((sum, w) => sum + (w.calories_burned || 0), 0);
    const workoutTypes = [...new Set(workouts.map(w => w.activity_type))];

    // Calculate nutrition stats
    const meals = nutritionResult.data || [];
    const avgDailyCalories = meals.length > 0 
      ? Math.round(meals.reduce((sum, m) => sum + (m.calories || 0), 0) / 7)
      : 0;
    const avgProtein = meals.length > 0
      ? Math.round(meals.reduce((sum, m) => sum + (m.protein_grams || 0), 0) / 7)
      : 0;
    const totalMealsLogged = meals.length;

    // Calculate weight change
    const weights = weightResult.data || [];
    let weightChange = null;
    if (weights.length >= 2) {
      const latest = weights[0].waist_inches; // Using waist as proxy - adjust based on actual weight column
      const earliest = weights[weights.length - 1].waist_inches;
      if (latest && earliest) {
        weightChange = latest - earliest;
      }
    }

    // Calculate steps
    const stepsEntries = stepsResult.data || [];
    const totalSteps = stepsEntries.reduce((sum, s) => sum + (s.score || 0), 0);
    const avgDailySteps = Math.round(totalSteps / 7);

    // Calculate sleep (if tracked)
    const sleepLogs = sleepResult.data || [];
    const avgSleepHours = sleepLogs.length > 0
      ? Math.round(sleepLogs.reduce((sum, s) => {
          const start = new Date(s.start_time);
          const end = s.end_time ? new Date(s.end_time) : start;
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        }, 0) / sleepLogs.length * 10) / 10
      : null;

    // Generate report
    const report = {
      period: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      workouts: {
        total: totalWorkouts,
        totalMinutes: totalWorkoutMinutes,
        caloriesBurned: totalCaloriesBurned,
        types: workoutTypes,
        avgPerDay: Math.round(totalWorkouts / 7 * 10) / 10,
      },
      nutrition: {
        mealsLogged: totalMealsLogged,
        avgDailyCalories,
        avgDailyProtein: avgProtein,
      },
      activity: {
        totalSteps,
        avgDailySteps,
      },
      sleep: {
        avgHours: avgSleepHours,
      },
      bodyProgress: {
        weightChange,
      },
      highlights: generateHighlights({
        totalWorkouts,
        avgDailyCalories,
        avgDailySteps,
        avgSleepHours,
      }),
    };

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating report:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateHighlights(stats: {
  totalWorkouts: number;
  avgDailyCalories: number;
  avgDailySteps: number;
  avgSleepHours: number | null;
}): string[] {
  const highlights: string[] = [];

  if (stats.totalWorkouts >= 5) {
    highlights.push("workout_streak");
  } else if (stats.totalWorkouts >= 3) {
    highlights.push("workout_consistent");
  }

  if (stats.avgDailySteps >= 10000) {
    highlights.push("steps_champion");
  } else if (stats.avgDailySteps >= 7000) {
    highlights.push("steps_active");
  }

  if (stats.avgSleepHours && stats.avgSleepHours >= 7) {
    highlights.push("sleep_great");
  }

  if (stats.avgDailyCalories > 0 && stats.avgDailyCalories <= 2200) {
    highlights.push("nutrition_balanced");
  }

  return highlights;
}
