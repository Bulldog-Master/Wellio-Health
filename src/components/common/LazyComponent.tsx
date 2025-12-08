import { lazy, Suspense, type ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentProps<T extends ComponentType<any>> {
  factory: () => Promise<{ default: T }>;
  fallback?: React.ReactNode;
}

const DefaultFallback = () => (
  <div className="space-y-3 p-6">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

/**
 * Utility component for lazy loading React components with Suspense
 * @param factory - Function that returns the dynamic import
 * @param fallback - Optional custom fallback component
 */
export function LazyComponent<T extends ComponentType<any>>({
  factory,
  fallback = <DefaultFallback />,
}: LazyComponentProps<T>) {
  const Component = lazy(factory);
  
  return (
    <Suspense fallback={fallback}>
      <Component {...({} as any)} />
    </Suspense>
  );
}

/**
 * Higher-order function to create a lazy loaded component
 * @param factory - Function that returns the dynamic import
 * @param fallback - Optional custom fallback
 * @returns Lazy loaded component wrapped in Suspense
 */
export function createLazyComponent<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): ComponentType<React.ComponentProps<T>> {
  const LazyComp = lazy(factory);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <DefaultFallback />}>
      <LazyComp {...props} />
    </Suspense>
  );
}
