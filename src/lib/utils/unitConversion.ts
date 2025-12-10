export type UnitSystem = 'imperial' | 'metric';

export const lbsToKg = (lbs: number): number => lbs * 0.453592;
export const kgToLbs = (kg: number): number => kg * 2.20462;

export const milesToKm = (miles: number): number => miles * 1.60934;
export const kmToMiles = (km: number): number => km * 0.621371;

export const formatWeight = (weightLbs: number, unit: UnitSystem): string => {
  if (unit === 'metric') {
    return `${lbsToKg(weightLbs).toFixed(1)} kg`;
  }
  return `${weightLbs.toFixed(1)} lbs`;
};

export const formatDistance = (distanceMiles: number, unit: UnitSystem): string => {
  if (unit === 'metric') {
    return `${milesToKm(distanceMiles).toFixed(2)} km`;
  }
  return `${distanceMiles.toFixed(2)} mi`;
};

export const parseWeight = (value: string, unit: UnitSystem): number => {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  // Always store in lbs in the database
  return unit === 'metric' ? kgToLbs(num) : num;
};

export const parseDistance = (value: string, unit: UnitSystem): number => {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  // Always store in miles in the database
  return unit === 'metric' ? kmToMiles(num) : num;
};
