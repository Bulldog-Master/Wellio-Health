import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/analytics';

/**
 * Hook to automatically track page views on route changes
 */
export function usePageTracking(): void {
  const location = useLocation();

  useEffect(() => {
    // Get page title from document or generate from path
    const title = document.title || getPageTitleFromPath(location.pathname);
    
    // Track the page view
    trackPageView(location.pathname, title);
  }, [location.pathname]);
}

/**
 * Generate a readable title from a URL path
 */
function getPageTitleFromPath(path: string): string {
  if (path === '/') return 'Home';
  
  // Remove leading slash and split by slashes
  const segments = path.slice(1).split('/');
  
  // Take the last segment and format it
  const lastSegment = segments[segments.length - 1] || 'Page';
  
  // Convert kebab-case to Title Case
  return lastSegment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
