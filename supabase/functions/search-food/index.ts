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
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching USDA FoodData Central for:', query);

    // Search USDA FoodData Central (no API key required for basic search)
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=DEMO_KEY&query=${encodeURIComponent(query)}&pageSize=10&dataType=Foundation,SR%20Legacy`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`USDA API error: ${response.status}`);
    }

    // Transform USDA data to our format
    const foods = data.foods?.map((food: any) => {
      const nutrients = food.foodNutrients || [];
      
      const getCalories = () => {
        const cal = nutrients.find((n: any) => n.nutrientName === 'Energy');
        return cal?.value || 0;
      };

      const getProtein = () => {
        const protein = nutrients.find((n: any) => n.nutrientName === 'Protein');
        return protein?.value || 0;
      };

      const getCarbs = () => {
        const carbs = nutrients.find((n: any) => n.nutrientName === 'Carbohydrate, by difference');
        return carbs?.value || 0;
      };

      const getFat = () => {
        const fat = nutrients.find((n: any) => n.nutrientName === 'Total lipid (fat)');
        return fat?.value || 0;
      };

      return {
        fdcId: food.fdcId,
        description: food.description,
        brandOwner: food.brandOwner || food.dataType,
        calories: Math.round(getCalories()),
        protein: Math.round(getProtein() * 10) / 10,
        carbs: Math.round(getCarbs() * 10) / 10,
        fat: Math.round(getFat() * 10) / 10,
      };
    }) || [];

    console.log(`Found ${foods.length} foods`);

    return new Response(
      JSON.stringify({ foods }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error searching foods:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to search foods' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});