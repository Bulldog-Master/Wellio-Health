import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  placeholder?: ReactNode;
  rootMargin?: string;
  threshold?: number;
  onVisible?: () => void;
}

/**
 * LazyLoad component that uses Intersection Observer to load children when visible
 * @param children - Content to lazy load
 * @param placeholder - Optional placeholder to show while loading
 * @param rootMargin - Margin around root for intersection observer (default: "200px")
 * @param threshold - Percentage of visibility required to trigger (default: 0.01)
 * @param onVisible - Callback when element becomes visible
 */
export const LazyLoad = ({
  children,
  placeholder = null,
  rootMargin = '200px',
  threshold = 0.01,
  onVisible,
}: LazyLoadProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin, threshold, onVisible]);

  return <div ref={ref}>{isVisible ? children : placeholder}</div>;
};
