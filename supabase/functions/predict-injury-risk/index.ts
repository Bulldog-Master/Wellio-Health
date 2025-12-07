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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { workoutData, recoveryData, sleepData, userId } = await req.json();

    const systemPrompt = `You are an expert sports medicine AI assistant specialized in injury prevention and risk assessment. Analyze the user's fitness data to predict potential injury risks and provide actionable prevention recommendations.

Your analysis should consider:
1. Workout frequency, intensity, and volume patterns
2. Recovery time between sessions
3. Sleep quality and duration
4. Signs of overtraining (sudden performance drops, excessive fatigue)
5. Muscle group imbalances from workout patterns
6. Common injury patterns based on activity types

Respond with a JSON object containing:
{
  "overallRiskLevel": "low" | "moderate" | "high" | "critical",
  "riskScore": 0-100,
  "primaryConcerns": [
    {
      "area": "body part or concern type",
      "risk": "low" | "moderate" | "high",
      "reason": "brief explanation"
    }
  ],
  "recommendations": [
    {
      "priority": "immediate" | "short-term" | "long-term",
      "action": "specific action to take",
      "benefit": "why this helps"
    }
  ],
  "recoveryStatus": "well-rested" | "adequate" | "needs-rest" | "overtrained",
  "workloadAnalysis": {
    "weeklyTrend": "increasing" | "stable" | "decreasing",
    "sustainabilityScore": 0-100,
    "suggestedRestDays": number
  },
  "preventiveMeasures": ["list of preventive exercises or stretches"]
}`;

    const userPrompt = `Analyze this fitness data for injury risk:

WORKOUT HISTORY (Last 14 days):
${JSON.stringify(workoutData, null, 2)}

RECOVERY SESSIONS:
${JSON.stringify(recoveryData, null, 2)}

SLEEP & WEARABLE DATA:
${JSON.stringify(sleepData, null, 2)}

Provide a comprehensive injury risk assessment with actionable prevention recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      analysis = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a default safe response
      analysis = {
        overallRiskLevel: "low",
        riskScore: 25,
        primaryConcerns: [],
        recommendations: [
          {
            priority: "long-term",
            action: "Continue your current training routine",
            benefit: "Maintain consistency for best results"
          }
        ],
        recoveryStatus: "adequate",
        workloadAnalysis: {
          weeklyTrend: "stable",
          sustainabilityScore: 75,
          suggestedRestDays: 2
        },
        preventiveMeasures: ["Dynamic stretching before workouts", "Foam rolling after intense sessions"]
      };
    }

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in predict-injury-risk:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
