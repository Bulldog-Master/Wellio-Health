# Performance Optimization Guide

## Bundle Analysis

The project includes `rollup-plugin-visualizer` for bundle analysis. After a production build, check `dist/stats.html` for a visual breakdown of bundle sizes.

## Current Optimizations

### Code Splitting
- **Lazy Loading**: 100+ routes use `React.lazy()` for code splitting
- **Eagerly Loaded**: Only critical paths (Auth, Index, Onboarding, Weight) load immediately
- **Vendor Chunks**: Separate chunks for React, Radix UI, React Query, Supabase, Recharts, i18n, date-fns

### Manual Chunks Configuration
```javascript
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
  'query-vendor': ['@tanstack/react-query'],
  'supabase-vendor': ['@supabase/supabase-js'],
  'chart-vendor': ['recharts'],
  'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
  'date-vendor': ['date-fns'],
}
```

## Image Optimization

### Current Hero Images (Need Optimization)
| Image | Current Size | Target Size |
|-------|-------------|-------------|
| hero-diverse.jpg | 125.84 KB | < 80 KB |
| auth-hero-new.jpg | 162.42 KB | < 100 KB |
| workout-hero.jpg | 165.56 KB | < 100 KB |

### Recommendations
1. **Convert to WebP**: Modern format with 25-35% size reduction
2. **Responsive Images**: Use `srcset` for different viewport sizes
3. **Lazy Loading**: Add `loading="lazy"` to below-fold images
4. **Compression**: Use tools like Squoosh or TinyPNG

### Image Component Best Practice
```tsx
<img 
  src={heroImage}
  alt="Hero"
  loading="lazy"
  decoding="async"
  width={1920}
  height={1080}
/>
```

## PWA Caching Strategy

### Current Configuration
- **Supabase API**: NetworkFirst (24-hour cache)
- **Storage/Images**: CacheFirst (30-day cache)
- **Static Assets**: Precached during SW install

## Performance Metrics to Monitor

1. **Core Web Vitals**
   - LCP (Largest Contentful Paint): < 2.5s
   - FID (First Input Delay): < 100ms
   - CLS (Cumulative Layout Shift): < 0.1

2. **Bundle Size Targets**
   - Initial JS: < 200KB gzipped
   - CSS: < 50KB gzipped
   - Hero Images: < 100KB each

## Quick Wins

### Already Implemented ✅
- [x] Route-based code splitting
- [x] Vendor chunk separation
- [x] PWA caching
- [x] Suspense boundaries

### Recommended Next Steps
- [ ] Convert images to WebP format
- [ ] Add image dimension attributes
- [ ] Implement intersection observer for lazy images
- [ ] Add resource hints (preconnect, prefetch)

## Testing Performance

1. **Lighthouse Audit**: Run in Chrome DevTools
2. **Bundle Analyzer**: Check `dist/stats.html` after build
3. **Network Throttling**: Test on slow 3G in DevTools
