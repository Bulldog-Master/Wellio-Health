// Location utility functions extracted from FitnessLocations.tsx

/**
 * Haversine formula to calculate distance between two coordinates
 * @returns Distance in miles
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Country to flag emoji mapping
const countryFlags: Record<string, string> = {
  'Canada': '🇨🇦',
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'Australia': '🇦🇺',
  'Germany': '🇩🇪',
  'France': '🇫🇷',
  'Spain': '🇪🇸',
  'Italy': '🇮🇹',
  'Japan': '🇯🇵',
  'China': '🇨🇳',
  'Brazil': '🇧🇷',
  'Mexico': '🇲🇽',
  'India': '🇮🇳',
  'Netherlands': '🇳🇱',
  'Sweden': '🇸🇪',
  'Norway': '🇳🇴',
  'Denmark': '🇩🇰',
  'Finland': '🇫🇮',
  'Switzerland': '🇨🇭',
  'Austria': '🇦🇹',
  'Belgium': '🇧🇪',
  'Portugal': '🇵🇹',
  'Ireland': '🇮🇪',
  'New Zealand': '🇳🇿',
  'South Korea': '🇰🇷',
  'Singapore': '🇸🇬',
  'South Africa': '🇿🇦',
  'Argentina': '🇦🇷',
  'Chile': '🇨🇱',
  'Colombia': '🇨🇴',
  'Poland': '🇵🇱',
  'Russia': '🇷🇺',
  'Thailand': '🇹🇭',
  'Indonesia': '🇮🇩',
  'Philippines': '🇵🇭',
  'Malaysia': '🇲🇾',
  'Vietnam': '🇻🇳',
  'UAE': '🇦🇪',
  'United Arab Emirates': '🇦🇪',
  'Saudi Arabia': '🇸🇦',
  'Israel': '🇮🇱',
  'Turkey': '🇹🇷',
  'Greece': '🇬🇷',
  'Czech Republic': '🇨🇿',
  'Hungary': '🇭🇺',
  'Romania': '🇷🇴',
  'Ukraine': '🇺🇦',
  'Egypt': '🇪🇬',
  'Nigeria': '🇳🇬',
  'Kenya': '🇰🇪',
  'Morocco': '🇲🇦',
  'Peru': '🇵🇪',
  'Venezuela': '🇻🇪',
  'Ecuador': '🇪🇨',
  'Costa Rica': '🇨🇷',
  'Panama': '🇵🇦',
  'Puerto Rico': '🇵🇷',
  'Iceland': '🇮🇸',
  'Luxembourg': '🇱🇺',
  'Croatia': '🇭🇷',
  'Serbia': '🇷🇸',
  'Bulgaria': '🇧🇬',
  'Slovakia': '🇸🇰',
  'Slovenia': '🇸🇮',
  'Estonia': '🇪🇪',
  'Latvia': '🇱🇻',
  'Lithuania': '🇱🇹',
  'Taiwan': '🇹🇼',
  'Hong Kong': '🇭🇰',
  'Pakistan': '🇵🇰',
  'Bangladesh': '🇧🇩',
  'Sri Lanka': '🇱🇰',
  'Nepal': '🇳🇵',
  'Qatar': '🇶🇦',
  'Kuwait': '🇰🇼',
  'Bahrain': '🇧🇭',
  'Oman': '🇴🇲',
  'Jordan': '🇯🇴',
  'Lebanon': '🇱🇧',
};

/**
 * Get country flag emoji for a country name
 */
export const getCountryFlag = (country: string): string => {
  // Try exact match first
  if (countryFlags[country]) {
    return countryFlags[country];
  }
  
  // Try case-insensitive match
  const lowerCountry = country.toLowerCase();
  for (const [key, flag] of Object.entries(countryFlags)) {
    if (key.toLowerCase() === lowerCountry) {
      return flag;
    }
  }
  
  // Default globe icon for unknown countries
  return '🌍';
};

export interface FitnessLocation {
  id: string;
  name: string;
  category: string;
  description: string | null;
  address: string | null;
  city: string;
  state: string | null;
  country: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  website_url: string | null;
  image_url: string | null;
  amenities: string[] | null;
  hours_of_operation: any;
  price_range: string | null;
  is_verified: boolean;
  average_rating: number;
  total_reviews: number;
  distance?: number;
}

/**
 * Group locations by country
 */
export const groupLocationsByCountry = (locations: FitnessLocation[]): Record<string, FitnessLocation[]> => {
  return locations.reduce((acc, location) => {
    const country = location.country || 'Unknown';
    if (!acc[country]) {
      acc[country] = [];
    }
    acc[country].push(location);
    return acc;
  }, {} as Record<string, FitnessLocation[]>);
};

/**
 * Get Google Maps directions URL for a location
 */
export const getDirectionsUrl = (location: FitnessLocation): string => {
  const address = [location.address, location.city, location.state, location.country]
    .filter(Boolean)
    .join(', ');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
};

/**
 * Location categories list
 */
export const locationCategories = [
  'all', 'gym', 'crossfit', 'mma', 'yoga', 'swimming', 
  'cycling', 'climbing', 'boxing', 'pilates', 'health_store', 'restaurant', 'other'
];
