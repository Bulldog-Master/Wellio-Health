// Common/shared components barrel export
// Re-exporting from root-level files that contain actual implementations

export { 
  PageLoadingSkeleton,
  LoadingSkeleton,
  PostSkeleton,
  CardSkeleton,
  ListItemSkeleton,
  WorkoutSkeleton,
  MealSkeleton,
  TableSkeleton,
  PhotoGridSkeleton,
  FormSkeleton,
  DashboardSkeleton
} from './LoadingSkeleton';

export { default as MetricCard } from './MetricCard';

// Re-exports from root - these files still exist at src/components/
export { MedicalAuthGate } from '../MedicalAuthGate';
export { NetworkStatus } from '../NetworkStatus';
export { OfflineIndicator } from '../OfflineIndicator';
export { OptimizedImage } from '../OptimizedImage';
export { PhoneInput } from '../PhoneInput';
export { ProtectedRoute } from '../ProtectedRoute';
export { RouteErrorBoundary } from '../RouteErrorBoundary';
export { SEOHead } from '../SEOHead';
export { SecurityBadges } from '../SecurityBadges';
export { SessionTimeoutProvider } from '../SessionTimeoutProvider';
export { SkipToContent } from '../SkipToContent';
