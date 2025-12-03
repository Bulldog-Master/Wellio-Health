import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, lat, lon, radius = 10000 } = await req.json();
    
    console.log('Discover gyms request:', { query, lat, lon, radius });

    let searchUrl: string;
    
    if (lat && lon) {
      // Search around coordinates using Overpass API for fitness-related places
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["leisure"="fitness_centre"](around:${radius},${lat},${lon});
          node["leisure"="sports_centre"](around:${radius},${lat},${lon});
          node["sport"="fitness"](around:${radius},${lat},${lon});
          node["amenity"="gym"](around:${radius},${lat},${lon});
          way["leisure"="fitness_centre"](around:${radius},${lat},${lon});
          way["leisure"="sports_centre"](around:${radius},${lat},${lon});
          way["sport"="fitness"](around:${radius},${lat},${lon});
          way["amenity"="gym"](around:${radius},${lat},${lon});
        );
        out center body;
      `;
      
      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      if (!response.ok) {
        console.error('Overpass API error:', response.status);
        throw new Error('Failed to search for gyms');
      }
      
      const overpassData = await response.json();
      console.log('Overpass results count:', overpassData.elements?.length || 0);
      
      // Transform Overpass results to our format
      const results = (overpassData.elements || []).map((element: any) => {
        const centerLat = element.lat || element.center?.lat;
        const centerLon = element.lon || element.center?.lon;
        const tags = element.tags || {};
        
        return {
          name: tags.name || tags.brand || 'Unnamed Gym',
          lat: centerLat,
          lon: centerLon,
          address: tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : null,
          city: tags['addr:city'] || null,
          state: tags['addr:state'] || null,
          country: tags['addr:country'] || null,
          postal_code: tags['addr:postcode'] || null,
          phone: tags.phone || tags['contact:phone'] || null,
          website: tags.website || tags['contact:website'] || null,
          category: detectCategory(tags),
          source: 'openstreetmap',
          osm_id: element.id,
        };
      }).filter((r: any) => r.name && r.name !== 'Unnamed Gym'); // Filter out unnamed
      
      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else if (query) {
      // Search by location name first, then search around it
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'User-Agent': 'WellioFitnessApp/1.0',
            'Accept': 'application/json',
          }
        }
      );
      
      if (!geoResponse.ok) {
        throw new Error('Failed to geocode location');
      }
      
      const geoResults = await geoResponse.json();
      
      if (!geoResults.length) {
        return new Response(
          JSON.stringify({ results: [], error: 'Location not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const { lat: centerLat, lon: centerLon } = geoResults[0];
      
      // Now search for gyms around this location
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["leisure"="fitness_centre"](around:${radius},${centerLat},${centerLon});
          node["leisure"="sports_centre"](around:${radius},${centerLat},${centerLon});
          node["sport"="fitness"](around:${radius},${centerLat},${centerLon});
          node["amenity"="gym"](around:${radius},${centerLat},${centerLon});
          way["leisure"="fitness_centre"](around:${radius},${centerLat},${centerLon});
          way["leisure"="sports_centre"](around:${radius},${centerLat},${centerLon});
          way["sport"="fitness"](around:${radius},${centerLat},${centerLon});
          way["amenity"="gym"](around:${radius},${centerLat},${centerLon});
        );
        out center body;
      `;
      
      const overpassUrl = 'https://overpass-api.de/api/interpreter';
      const response = await fetch(overpassUrl, {
        method: 'POST',
        body: `data=${encodeURIComponent(overpassQuery)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      
      if (!response.ok) {
        console.error('Overpass API error:', response.status);
        throw new Error('Failed to search for gyms');
      }
      
      const overpassData = await response.json();
      console.log('Overpass results for query:', query, 'count:', overpassData.elements?.length || 0);
      
      const results = (overpassData.elements || []).map((element: any) => {
        const elemLat = element.lat || element.center?.lat;
        const elemLon = element.lon || element.center?.lon;
        const tags = element.tags || {};
        
        return {
          name: tags.name || tags.brand || 'Unnamed Gym',
          lat: elemLat,
          lon: elemLon,
          address: tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : null,
          city: tags['addr:city'] || null,
          state: tags['addr:state'] || null,
          country: tags['addr:country'] || null,
          postal_code: tags['addr:postcode'] || null,
          phone: tags.phone || tags['contact:phone'] || null,
          website: tags.website || tags['contact:website'] || null,
          category: detectCategory(tags),
          source: 'openstreetmap',
          osm_id: element.id,
        };
      }).filter((r: any) => r.name && r.name !== 'Unnamed Gym');
      
      return new Response(
        JSON.stringify({ 
          results,
          searchCenter: { lat: parseFloat(centerLat), lon: parseFloat(centerLon) }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Either query or lat/lon required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Discover gyms error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to discover gyms' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectCategory(tags: Record<string, string>): string {
  const sport = tags.sport?.toLowerCase() || '';
  const name = tags.name?.toLowerCase() || '';
  const leisure = tags.leisure?.toLowerCase() || '';
  
  if (sport.includes('crossfit') || name.includes('crossfit')) return 'crossfit';
  if (sport.includes('yoga') || name.includes('yoga')) return 'yoga';
  if (sport.includes('swimming') || leisure.includes('swimming')) return 'swimming';
  if (sport.includes('boxing') || name.includes('boxing')) return 'boxing';
  if (sport.includes('mma') || sport.includes('martial') || name.includes('mma')) return 'mma';
  if (sport.includes('cycling') || name.includes('cycling') || name.includes('spin')) return 'cycling';
  if (sport.includes('climbing') || name.includes('climbing') || name.includes('boulder')) return 'climbing';
  if (sport.includes('pilates') || name.includes('pilates')) return 'pilates';
  
  return 'gym';
}
