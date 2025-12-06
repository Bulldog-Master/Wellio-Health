/**
 * Location Obfuscation Utilities
 * 
 * Provides functions to protect user location privacy by:
 * - Generalizing coordinates to approximate areas
 * - Stripping street-level detail from addresses
 * - Converting precise locations to city/region level
 */

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface ObfuscatedLocation {
  city?: string;
  region?: string;
  country?: string;
  approximateCoordinates?: Coordinates;
}

/**
 * Round coordinates to reduce precision (~1km accuracy)
 * This prevents pinpointing exact locations while still allowing
 * general area-based features like "nearby users"
 */
export function obfuscateCoordinates(lat: number, lng: number, precisionKm: number = 1): Coordinates {
  // 1 degree latitude ≈ 111km, adjust precision accordingly
  const decimalPlaces = Math.max(0, 2 - Math.floor(Math.log10(precisionKm)));
  const factor = Math.pow(10, decimalPlaces);
  
  // Add small random offset for additional privacy
  const latOffset = (Math.random() - 0.5) * (precisionKm / 111);
  const lngOffset = (Math.random() - 0.5) * (precisionKm / 111);
  
  return {
    latitude: Math.round((lat + latOffset) * factor) / factor,
    longitude: Math.round((lng + lngOffset) * factor) / factor,
  };
}

/**
 * Strip street-level detail from an address
 * Returns only city, region, country
 */
export function obfuscateAddress(fullAddress: string): string {
  // Common patterns to strip
  const streetPatterns = [
    /^\d+\s+/,  // Leading numbers
    /\b\d+[-\s]?\d*\s*/g, // Street numbers
    /\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|ct|court|pl|place|cir|circle|hwy|highway)\b\.?\s*/gi,
    /\b(apt|apartment|suite|ste|unit|#)\s*[\w-]+\s*/gi,
    /^\s*,\s*/,  // Leading comma
    /\s*,\s*,\s*/g, // Double commas
    /,\s*$/,  // Trailing comma
  ];
  
  let result = fullAddress;
  
  for (const pattern of streetPatterns) {
    result = result.replace(pattern, '');
  }
  
  // Clean up whitespace
  result = result.replace(/\s+/g, ' ').trim();
  
  // If we have comma-separated parts, take only city onward
  const parts = result.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length > 2) {
    // Assume format: Street, City, Region, Country - take last 3
    return parts.slice(-3).join(', ');
  }
  
  return result || 'Location hidden';
}

/**
 * Extract just the city/region from a full address
 */
export function extractCityRegion(fullAddress: string): ObfuscatedLocation {
  const parts = fullAddress.split(',').map(p => p.trim()).filter(Boolean);
  
  if (parts.length === 0) {
    return {};
  }
  
  if (parts.length === 1) {
    return { city: parts[0] };
  }
  
  if (parts.length === 2) {
    return { city: parts[0], country: parts[1] };
  }
  
  // For longer addresses, extract city, region, country
  return {
    city: parts[parts.length - 3] || parts[0],
    region: parts[parts.length - 2],
    country: parts[parts.length - 1],
  };
}

/**
 * Format location for public display
 * Only shows city, region - never street-level detail
 */
export function formatPublicLocation(location: string | null | undefined): string {
  if (!location) return '';
  
  const obfuscated = extractCityRegion(location);
  
  const parts = [
    obfuscated.city,
    obfuscated.region,
    obfuscated.country,
  ].filter(Boolean);
  
  // Show at most city and country
  if (parts.length > 2) {
    return `${parts[0]}, ${parts[parts.length - 1]}`;
  }
  
  return parts.join(', ');
}

/**
 * Validate that a location string doesn't contain street-level detail
 * Returns true if the location is appropriately generalized
 */
export function isLocationGeneralized(location: string): boolean {
  const streetIndicators = [
    /\d+\s+(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|way|ct|court|pl|place)/i,
    /\b(apt|apartment|suite|ste|unit|#)\s*[\w-]+/i,
    /^\d{1,5}\s+\w/,  // Starts with number + street name
  ];
  
  return !streetIndicators.some(pattern => pattern.test(location));
}

/**
 * Calculate approximate distance between two obfuscated coordinates
 * Uses Haversine formula, returns distance in kilometers
 */
export function calculateApproximateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLng = toRadians(point2.longitude - point1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) * 
    Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Round to nearest km for privacy
  return Math.round(R * c);
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Get a privacy-safe distance description
 * Instead of exact distance, returns ranges
 */
export function getDistanceDescription(distanceKm: number): string {
  if (distanceKm < 1) return 'Very close by';
  if (distanceKm < 5) return 'Nearby';
  if (distanceKm < 10) return 'Within 10 km';
  if (distanceKm < 25) return 'Within 25 km';
  if (distanceKm < 50) return 'Within 50 km';
  if (distanceKm < 100) return 'Within 100 km';
  return 'Far away';
}
