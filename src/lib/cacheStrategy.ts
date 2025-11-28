/**
 * Advanced caching strategies for PWA
 */

const CACHE_VERSION = 'v1';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;

export const CACHE_STRATEGY = {
  // Static assets - cache first
  static: [
    '/',
    '/index.html',
    '/manifest.json',
  ],
  
  // API responses - network first
  api: [
    /^https:\/\/.*\.supabase\.co\/rest\/.*/,
  ],
  
  // Images - cache first with fallback
  images: [
    /\.(jpg|jpeg|png|gif|webp|svg)$/,
  ],
};

export const getCacheName = (type: 'static' | 'dynamic' | 'image') => {
  switch (type) {
    case 'static':
      return STATIC_CACHE;
    case 'dynamic':
      return DYNAMIC_CACHE;
    case 'image':
      return IMAGE_CACHE;
  }
};

export const cleanupOldCaches = async () => {
  const cacheNames = await caches.keys();
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE];
  
  return Promise.all(
    cacheNames
      .filter(name => !currentCaches.includes(name))
      .map(name => caches.delete(name))
  );
};
