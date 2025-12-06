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

    const { audioBase64, logType } = await req.json();
    
    if (!audioBase64) {
      throw new Error("No audio data provided");
    }

    console.log("Processing voice input for log type:", logType);

    // Use Gemini to transcribe and extract structured data
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: `You are a voice logging assistant for a fitness app. The user will provide voice transcription about their ${logType || 'activity'}. Extract structured data and respond with JSON.

For workout logs, extract:
- activity_type: string (e.g., "running", "weightlifting", "yoga")
- duration_minutes: number
- calories_burned: number (estimate if not mentioned)
- distance_miles: number (if applicable)
- notes: string

For meal logs, extract:
- food_name: string
- meal_type: string (breakfast, lunch, dinner, snack)
- calories: number (estimate)
- protein_grams: number (estimate)
- carbs_grams: number (estimate)
- fat_grams: number (estimate)

For weight logs, extract:
- weight: number
- unit: string (lbs or kg)
- notes: string

For step logs, extract:
- steps: number
- distance_miles: number (estimate: steps * 0.0004)

Respond ONLY with valid JSON, no markdown.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Transcribe this audio and extract the fitness data:"
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:audio/webm;base64,${audioBase64}`
                }
              }
            ]
          }
        ],
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
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let parsedData;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      parsedData = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      parsedData = { transcription: content, error: "Could not parse structured data" };
    }

    console.log("Voice data extracted:", parsedData);

    return new Response(JSON.stringify({ 
      success: true,
      data: parsedData,
      logType 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Voice-to-text error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to process voice input" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
