import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

/**
 * Custom hook for intersection observer
 * Useful for implementing infinite scroll and lazy loading
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const elementRef = useRef<Element | null>(null);
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const node = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      observerParams
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold, root, rootMargin, frozen]);

  return { ref: elementRef, entry, isIntersecting: !!entry?.isIntersecting };
}
