import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  console.log("[generate-insights] Request received:", req.method);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authHeader = req.headers.get("Authorization");
    
    console.log("[generate-insights] Env check - URL exists:", !!supabaseUrl, "ServiceKey exists:", !!serviceRoleKey, "Auth exists:", !!authHeader);
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Create admin client to verify the JWT
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    
    // Extract JWT from Authorization header
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "No authorization token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[generate-insights] Getting user from token...");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    console.log("[generate-insights] User result:", user?.id || "no user", "Error:", userError?.message || "none");
    
    // Create a client for data access using the user's context
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: { Authorization: authHeader || "" },
        },
      }
    );

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("[generate-insights] Starting insight generation for user:", user.id);

    // Fetch user's health data with individual error handling
    console.log("[generate-insights] Fetching health data...");
    
    let weightLogs: any[] = [];
    let activityLogs: any[] = [];
    let nutritionLogs: any[] = [];
    let symptoms: any[] = [];
    let habits: any[] = [];

    try {
      const [weightRes, activityRes, nutritionRes, symptomsRes, habitsRes] = await Promise.all([
        supabaseClient
          .from("weight_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false })
          .limit(30),
        supabaseClient
          .from("activity_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false })
          .limit(30),
        supabaseClient
          .from("nutrition_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false })
          .limit(30),
        supabaseClient
          .from("symptoms")
          .select("*")
          .eq("user_id", user.id)
          .order("logged_at", { ascending: false })
          .limit(30),
        supabaseClient
          .from("habits")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true),
      ]);

      weightLogs = weightRes.data || [];
      activityLogs = activityRes.data || [];
      nutritionLogs = nutritionRes.data || [];
      symptoms = symptomsRes.data || [];
      habits = habitsRes.data || [];
    } catch (fetchError) {
      console.error("[generate-insights] Error fetching data:", fetchError);
    }

    console.log("[generate-insights] Data fetched:", {
      weightLogs: weightLogs.length,
      activityLogs: activityLogs.length,
      nutritionLogs: nutritionLogs.length,
      symptoms: symptoms.length,
      habits: habits.length,
    });

    // Build context for AI
    const dataSummary = {
      weight_logs_count: weightLogs.length,
      activity_logs_count: activityLogs.length,
      nutrition_logs_count: nutritionLogs.length,
      symptoms_count: symptoms.length,
      active_habits_count: habits.length,
      total_activity_minutes: activityLogs.reduce((sum: number, log: any) => sum + (log.duration_minutes || 0), 0),
      average_calories_consumed: nutritionLogs.length > 0
        ? Math.round(nutritionLogs.reduce((sum: number, log: any) => sum + (log.calories || 0), 0) / nutritionLogs.length)
        : 0,
    };

    console.log("[generate-insights] Data summary built:", dataSummary);

    const prompt = `As a health and wellness AI assistant, analyze the following user health data and provide 3-5 personalized insights, recommendations, or observations. Be encouraging and specific.

Data Summary:
- Weight logs: ${dataSummary.weight_logs_count} entries
- Activity logs: ${dataSummary.activity_logs_count} entries (${dataSummary.total_activity_minutes} total minutes)
- Nutrition logs: ${dataSummary.nutrition_logs_count} entries (avg ${dataSummary.average_calories_consumed} cal/day)
- Symptoms tracked: ${dataSummary.symptoms_count} entries
- Active habits: ${dataSummary.active_habits_count}

Recent Activity: ${activityLogs.slice(0, 5).map((a: any) => `${a.activity_type} for ${a.duration_minutes} min`).join(", ") || "No recent activity"}
Recent Symptoms: ${symptoms.slice(0, 3).map((s: any) => `${s.symptom_name} (severity ${s.severity}/10)`).join(", ") || "No recent symptoms"}

Provide 3-5 actionable insights in this exact JSON format:
{
  "insights": [
    {
      "type": "recommendation" | "trend" | "alert" | "achievement",
      "text": "Your insight text here"
    }
  ]
}`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[generate-insights] LOVABLE_API_KEY not configured");
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("[generate-insights] Calling AI gateway...");
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a supportive health and wellness coach. Provide actionable, encouraging insights.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    console.log("[generate-insights] AI response status:", aiResponse.status);
    
    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Please add more credits to continue.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResponse.json();
    console.log("[generate-insights] AI response received");
    const content = aiData.choices[0].message.content;

    // Parse the JSON response
    let insights;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        insights = parsed.insights;
      } else {
        // Fallback if AI doesn't return proper JSON
        insights = [
          {
            type: "recommendation",
            text: content,
          },
        ];
      }
    } catch (e) {
      insights = [
        {
          type: "recommendation",
          text: content,
        },
      ];
    }

    // Store insights in database
    console.log("[generate-insights] Storing", insights.length, "insights...");
    const insightsToStore = insights.map((insight: { type: string; text: string }) => ({
      user_id: user.id,
      insight_text: insight.text,
      insight_type: insight.type,
      data_summary: dataSummary,
    }));

    await supabaseClient.from("ai_insights").insert(insightsToStore);

    console.log("[generate-insights] Success! Returning insights.");
    return new Response(
      JSON.stringify({
        insights,
        data_summary: dataSummary,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error in generate-insights:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
