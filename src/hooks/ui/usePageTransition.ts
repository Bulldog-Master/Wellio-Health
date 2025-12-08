import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook for smooth page transitions
 * Returns whether the page is currently transitioning
 */
export function usePageTransition(duration: number = 300): boolean {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [location.pathname, duration]);
  
  return isTransitioning;
}

/**
 * Hook that returns a class name for page transitions
 */
export function usePageTransitionClass(): string {
  const isTransitioning = usePageTransition();
  return isTransitioning ? 'opacity-0' : 'opacity-100 transition-opacity duration-300';
}

/**
 * Hook for scroll-triggered animations
 */
export function useScrollAnimation() {
  const [hasScrolled, setHasScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 100);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return hasScrolled;
}
