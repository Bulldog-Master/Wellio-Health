/**
 * Utilities Module - Barrel Export
 * 
 * General-purpose utility functions
 */

// Core utilities (cn for classnames)
export { cn } from './utils';

// Locale-aware formatting
export {
  formatNumber,
  formatPercent,
  formatCurrency,
  formatCompact,
  formatOrdinal,
  formatCalories,
  formatDuration,
  formatWeight as formatWeightLocale,
  formatDistance as formatDistanceLocale,
  formatRelativeTime,
  getDecimalSeparator,
  getThousandsSeparator,
} from './formatUtils';

// Unit conversion (imperial/metric)
export {
  lbsToKg,
  kgToLbs,
  milesToKm,
  kmToMiles,
  formatWeight,
  formatDistance,
  parseWeight,
  parseDistance,
  type UnitSystem,
} from './unitConversion';
