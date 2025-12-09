/**
 * Image optimization utilities for better performance
 */

/**
 * Generate srcset for responsive images
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): string {
  // For Supabase storage, we can't dynamically resize, so return base URL
  // This is a placeholder for when image resizing is available
  return baseUrl;
}

/**
 * Get optimized image URL with quality parameter
 */
export function getOptimizedImageUrl(
  url: string,
  options: { width?: number; quality?: number } = {}
): string {
  // If it's a Supabase storage URL, return as-is
  // Future: integrate with image transformation service
  return url;
}

/**
 * Create a blur placeholder data URL
 */
export function createBlurPlaceholder(color = '#1e2433'): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5">
      <filter id="b" color-interpolation-filters="sRGB">
        <feGaussianBlur stdDeviation="1"/>
      </filter>
      <rect preserveAspectRatio="none" filter="url(#b)" x="0" y="0" height="100%" width="100%" fill="${color}"/>
    </svg>
  `;
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
}

/**
 * Intersection Observer options for lazy loading images
 */
export const lazyLoadOptions: IntersectionObserverInit = {
  rootMargin: '50px 0px', // Start loading 50px before entering viewport
  threshold: 0.01,
};

/**
 * Check if browser supports lazy loading natively
 */
export const supportsNativeLazyLoading = 'loading' in HTMLImageElement.prototype;

/**
 * Format bytes to human readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
