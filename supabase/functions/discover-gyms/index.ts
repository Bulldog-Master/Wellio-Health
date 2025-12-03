import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map our categories to OSM tags
const categoryToOsmTags: Record<string, string[]> = {
  gym: ['leisure=fitness_centre', 'leisure=sports_centre', 'sport=fitness', 'amenity=gym'],
  crossfit: ['sport=crossfit', 'leisure=fitness_centre'],
  yoga: ['sport=yoga', 'leisure=fitness_centre', 'shop=yoga'],
  swimming: ['leisure=swimming_pool', 'sport=swimming'],
  boxing: ['sport=boxing', 'leisure=sports_centre'],
  mma: ['sport=martial_arts', 'sport=mma', 'sport=judo', 'sport=karate', 'sport=taekwondo'],
  cycling: ['sport=cycling', 'leisure=sports_centre', 'shop=bicycle'],
  climbing: ['sport=climbing', 'leisure=climbing'],
  pilates: ['sport=pilates', 'leisure=fitness_centre'],
  all: ['leisure=fitness_centre', 'leisure=sports_centre', 'sport=fitness', 'amenity=gym', 'sport=yoga', 'sport=swimming', 'sport=boxing', 'sport=martial_arts', 'sport=climbing', 'sport=cycling'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, lat, lon, radius = 15000, category = 'all' } = await req.json();
    
    console.log('Discover facilities request:', { query, lat, lon, radius, category });

    // Build Overpass query based on category
    const osmTags = categoryToOsmTags[category] || categoryToOsmTags.all;
    
    const buildOverpassQuery = (centerLat: number, centerLon: number) => {
      const nodeQueries = osmTags.map(tag => {
        const [key, value] = tag.split('=');
        return `node["${key}"="${value}"](around:${radius},${centerLat},${centerLon});`;
      }).join('\n');
      
      const wayQueries = osmTags.map(tag => {
        const [key, value] = tag.split('=');
        return `way["${key}"="${value}"](around:${radius},${centerLat},${centerLon});`;
      }).join('\n');
      
      return `
        [out:json][timeout:25];
        (
          ${nodeQueries}
          ${wayQueries}
        );
        out center body;
      `;
    };

    let centerLat: number;
    let centerLon: number;

    if (lat && lon) {
      centerLat = lat;
      centerLon = lon;
    } else if (query) {
      // Geocode the query first
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
      
      centerLat = parseFloat(geoResults[0].lat);
      centerLon = parseFloat(geoResults[0].lon);
    } else {
      return new Response(
        JSON.stringify({ error: 'Either query or lat/lon required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Search Overpass API
    const overpassQuery = buildOverpassQuery(centerLat, centerLon);
    console.log('Overpass query for category:', category);
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    
    if (!response.ok) {
      console.error('Overpass API error:', response.status);
      throw new Error('Failed to search for facilities');
    }
    
    const overpassData = await response.json();
    console.log('Overpass results count:', overpassData.elements?.length || 0);
    
    const results = (overpassData.elements || []).map((element: any) => {
      const elemLat = element.lat || element.center?.lat;
      const elemLon = element.lon || element.center?.lon;
      const tags = element.tags || {};
      
      return {
        name: tags.name || tags.brand || 'Unnamed Facility',
        lat: elemLat,
        lon: elemLon,
        address: tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : null,
        city: tags['addr:city'] || null,
        state: tags['addr:state'] || null,
        country: tags['addr:country'] || null,
        postal_code: tags['addr:postcode'] || null,
        phone: tags.phone || tags['contact:phone'] || null,
        website: tags.website || tags['contact:website'] || null,
        category: detectCategory(tags, category),
        source: 'openstreetmap',
        osm_id: element.id,
      };
    }).filter((r: any) => r.name && r.name !== 'Unnamed Facility');
    
    return new Response(
      JSON.stringify({ 
        results,
        searchCenter: { lat: centerLat, lon: centerLon }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Discover facilities error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to discover facilities' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectCategory(tags: Record<string, string>, requestedCategory: string): string {
  // If user requested a specific category, use it
  if (requestedCategory !== 'all') return requestedCategory;
  
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
