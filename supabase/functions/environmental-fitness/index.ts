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
    const { latitude, longitude, userPreferences } = await req.json();
    
    console.log('Analyzing environmental conditions for fitness:', { latitude, longitude });

    // Fetch weather data from Open-Meteo (free, no API key required)
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,uv_index&hourly=temperature_2m,precipitation_probability,uv_index&daily=temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_sum&timezone=auto`;
    
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      console.error('Weather API error:', weatherResponse.status);
      return new Response(JSON.stringify(generateMockRecommendations()), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const weatherData = await weatherResponse.json();
    const current = weatherData.current;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.log('No API key, returning weather-based recommendations');
      return new Response(JSON.stringify(generateWeatherBasedRecommendations(weatherData)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const prompt = `Based on these current weather conditions, provide personalized fitness recommendations:

Weather Data:
- Temperature: ${current.temperature_2m}°C (feels like ${current.apparent_temperature}°C)
- Humidity: ${current.relative_humidity_2m}%
- Wind Speed: ${current.wind_speed_10m} km/h
- UV Index: ${current.uv_index}
- Precipitation: ${current.precipitation} mm
- Weather Code: ${current.weather_code}

User Preferences: ${JSON.stringify(userPreferences || {})}

Provide a JSON response with:
1. overallScore: number 1-100 (how suitable conditions are for outdoor exercise)
2. outdoorRecommendation: "excellent" | "good" | "moderate" | "poor" | "avoid"
3. bestWorkoutTypes: array of recommended workout types for these conditions
4. warnings: array of any weather-related concerns
5. hydrationAdvice: specific hydration recommendations
6. clothingAdvice: what to wear for these conditions
7. bestTimeToWorkout: recommended times based on hourly forecast
8. indoorAlternatives: suggested indoor workouts if outdoor is not ideal
9. uvProtection: UV-related advice if applicable
10. airQualityNote: any air quality considerations`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a fitness and weather expert. Provide personalized workout recommendations based on environmental conditions. Always respond with valid JSON.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', response.status);
      return new Response(JSON.stringify(generateWeatherBasedRecommendations(weatherData)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    let recommendations;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      recommendations = jsonMatch ? JSON.parse(jsonMatch[0]) : generateWeatherBasedRecommendations(weatherData);
    } catch {
      console.error('Failed to parse AI response');
      recommendations = generateWeatherBasedRecommendations(weatherData);
    }

    // Add raw weather data to response
    recommendations.currentWeather = {
      temperature: current.temperature_2m,
      feelsLike: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      uvIndex: current.uv_index,
      precipitation: current.precipitation,
      weatherCode: current.weather_code
    };

    return new Response(JSON.stringify(recommendations), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in environmental-fitness:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateWeatherBasedRecommendations(weatherData: any) {
  const current = weatherData.current;
  const temp = current.temperature_2m;
  const humidity = current.relative_humidity_2m;
  const uvIndex = current.uv_index;
  const windSpeed = current.wind_speed_10m;
  
  let overallScore = 80;
  let outdoorRecommendation = "good";
  const warnings: string[] = [];
  const bestWorkoutTypes: string[] = [];
  
  // Temperature adjustments
  if (temp < 0) {
    overallScore -= 30;
    outdoorRecommendation = "poor";
    warnings.push("Very cold temperatures - dress in layers");
    bestWorkoutTypes.push("Indoor cardio", "Gym workout");
  } else if (temp < 10) {
    overallScore -= 10;
    warnings.push("Cool temperatures - warm up thoroughly");
    bestWorkoutTypes.push("Running", "Cycling", "HIIT");
  } else if (temp > 35) {
    overallScore -= 40;
    outdoorRecommendation = "avoid";
    warnings.push("Extreme heat - avoid intense outdoor exercise");
    bestWorkoutTypes.push("Swimming", "Indoor workout", "Early morning yoga");
  } else if (temp > 28) {
    overallScore -= 20;
    outdoorRecommendation = "moderate";
    warnings.push("Hot conditions - stay hydrated");
    bestWorkoutTypes.push("Swimming", "Light cardio", "Morning run");
  } else {
    bestWorkoutTypes.push("Running", "Cycling", "Outdoor HIIT", "Tennis");
  }
  
  // UV adjustments
  if (uvIndex > 8) {
    overallScore -= 15;
    warnings.push("Very high UV - use SPF 50+ sunscreen");
  } else if (uvIndex > 5) {
    warnings.push("Moderate UV - wear sunscreen and hat");
  }
  
  // Humidity adjustments
  if (humidity > 80) {
    overallScore -= 10;
    warnings.push("High humidity - reduce workout intensity");
  }
  
  // Wind adjustments
  if (windSpeed > 40) {
    overallScore -= 20;
    warnings.push("Strong winds - avoid cycling, consider indoor workout");
  }
  
  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    outdoorRecommendation,
    bestWorkoutTypes,
    warnings,
    hydrationAdvice: temp > 25 ? "Drink 500ml water before workout, 200ml every 15 minutes during" : "Stay hydrated - aim for 2-3 liters throughout the day",
    clothingAdvice: getClothingAdvice(temp),
    bestTimeToWorkout: temp > 28 ? ["6:00 AM - 8:00 AM", "6:00 PM - 8:00 PM"] : ["Morning", "Afternoon", "Evening"],
    indoorAlternatives: ["Home workout", "Gym session", "Yoga", "Indoor swimming"],
    uvProtection: uvIndex > 3 ? "Apply SPF 30+ sunscreen, wear UV-protective clothing" : "Low UV - minimal protection needed",
    airQualityNote: "Check local air quality index before outdoor exercise",
    currentWeather: {
      temperature: temp,
      feelsLike: current.apparent_temperature,
      humidity,
      windSpeed,
      uvIndex,
      precipitation: current.precipitation,
      weatherCode: current.weather_code
    }
  };
}

function getClothingAdvice(temp: number): string {
  if (temp < 0) return "Heavy layers, thermal base, gloves, warm hat";
  if (temp < 10) return "Long sleeves, light jacket, gloves optional";
  if (temp < 20) return "Light long sleeves or t-shirt with light layer";
  if (temp < 28) return "Breathable t-shirt and shorts";
  return "Lightweight, loose-fitting, light-colored clothing";
}

function generateMockRecommendations() {
  return {
    overallScore: 75,
    outdoorRecommendation: "good",
    bestWorkoutTypes: ["Running", "Cycling", "Outdoor HIIT"],
    warnings: ["Stay hydrated"],
    hydrationAdvice: "Drink water before, during, and after your workout",
    clothingAdvice: "Breathable athletic wear recommended",
    bestTimeToWorkout: ["Morning", "Evening"],
    indoorAlternatives: ["Home workout", "Gym session"],
    uvProtection: "Apply sunscreen if exercising during peak sun hours",
    airQualityNote: "Check local conditions before outdoor exercise",
    currentWeather: {
      temperature: 22,
      feelsLike: 23,
      humidity: 55,
      windSpeed: 10,
      uvIndex: 4,
      precipitation: 0,
      weatherCode: 0
    }
  };
}
