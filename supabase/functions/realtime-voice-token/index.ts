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
    // Validate authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Generating ephemeral token for user:", user.id);

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Get user profile for personalization
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('username, display_name')
      .eq('id', user.id)
      .single();

    const userName = profile?.display_name || profile?.username || 'athlete';

    // Request an ephemeral token from OpenAI
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "alloy",
        instructions: `You are an enthusiastic, motivating AI fitness coach named Coach Wellio. You're helping ${userName} with their workout in real-time.

Your personality:
- Energetic and encouraging, like a supportive personal trainer
- Give clear, concise instructions during exercises
- Count reps when asked, with proper timing (e.g., "One... Two... Three...")
- Provide form tips and breathing reminders
- Celebrate achievements and push through tough moments
- Keep responses short during active exercise (1-2 sentences max)
- Be more conversational during rest periods

Key capabilities:
- Guide users through exercises with verbal cues
- Count reps with appropriate pacing for different exercises
- Provide breathing guidance (e.g., "Breathe in on the way down, out on the way up")
- Offer form corrections based on common mistakes
- Give motivational encouragement
- Suggest modifications for difficulty adjustments
- Track rest periods and tell users when to resume

When counting reps:
- Use a steady, rhythmic pace appropriate for the exercise
- For fast exercises (jumping jacks): count every 1-2 seconds
- For slow exercises (squats): count every 2-3 seconds
- Say the number clearly and enthusiastically

Always be safety-conscious and remind users to:
- Warm up properly
- Stay hydrated
- Listen to their body
- Stop if they feel pain (not just muscle burn)

Current date: ${new Date().toLocaleDateString()}
Remember: Keep it fun, motivating, and effective!`
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI session error:", response.status, errorText);
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    console.log("Session created for user:", user.id);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
