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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { weekStartDate } = await req.json();
    
    console.log("Generating grocery list for user:", user.id, "week:", weekStartDate);

    // Fetch meal plans for the week
    const { data: mealPlans, error: mealError } = await supabaseAdmin
      .from('meal_plans')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStartDate);

    if (mealError) {
      console.error("Error fetching meal plans:", mealError);
      throw mealError;
    }

    if (!mealPlans || mealPlans.length === 0) {
      return new Response(JSON.stringify({ 
        success: true,
        groceryList: [],
        message: "No meal plans found for this week"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract food names from meal plans
    const foods = mealPlans.map(meal => meal.food_name);

    // Use AI to generate grocery list with quantities
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
            content: `You are a grocery list generator. Given a list of meals, generate a consolidated grocery list with:
1. All ingredients needed
2. Estimated quantities
3. Organized by category (Produce, Proteins, Dairy, Grains, Pantry, etc.)

Respond with JSON in this format:
{
  "categories": [
    {
      "name": "Category Name",
      "items": [
        { "name": "Item name", "quantity": "Amount needed", "unit": "unit" }
      ]
    }
  ],
  "tips": ["Shopping tip 1", "Shopping tip 2"]
}`
          },
          {
            role: "user",
            content: `Generate a grocery list for these meals planned for the week:\n${foods.join('\n')}`
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let groceryList;
    try {
      const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
      groceryList = JSON.parse(cleanContent);
    } catch (e) {
      console.error("Failed to parse grocery list:", content);
      groceryList = { categories: [], tips: [] };
    }

    console.log("Grocery list generated successfully");

    return new Response(JSON.stringify({ 
      success: true,
      groceryList,
      mealCount: mealPlans.length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Grocery list error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Failed to generate grocery list" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
