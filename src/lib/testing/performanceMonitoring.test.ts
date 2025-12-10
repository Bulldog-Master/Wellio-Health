import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackWebVital, getWebVitals, trackTiming, startMeasure } from '../services/performanceMonitoring';

describe('Performance Monitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track web vitals correctly', () => {
    trackWebVital('LCP', 2000);
    const vitals = getWebVitals();
    
    expect(vitals.LCP).toBeDefined();
    expect(vitals.LCP?.value).toBe(2000);
    expect(vitals.LCP?.rating).toBe('good');
  });

  it('should rate LCP correctly', () => {
    // Good LCP (< 2500ms)
    trackWebVital('LCP', 2000);
    expect(getWebVitals().LCP?.rating).toBe('good');
    
    // Needs improvement (2500-4000ms)
    trackWebVital('LCP', 3000);
    expect(getWebVitals().LCP?.rating).toBe('needs-improvement');
    
    // Poor (> 4000ms)
    trackWebVital('LCP', 5000);
    expect(getWebVitals().LCP?.rating).toBe('poor');
  });

  it('should rate CLS correctly', () => {
    // Good CLS (< 0.1)
    trackWebVital('CLS', 0.05);
    expect(getWebVitals().CLS?.rating).toBe('good');
    
    // Needs improvement (0.1-0.25)
    trackWebVital('CLS', 0.15);
    expect(getWebVitals().CLS?.rating).toBe('needs-improvement');
    
    // Poor (> 0.25)
    trackWebVital('CLS', 0.3);
    expect(getWebVitals().CLS?.rating).toBe('poor');
  });

  it('should rate FID correctly', () => {
    // Good FID (< 100ms)
    trackWebVital('FID', 50);
    expect(getWebVitals().FID?.rating).toBe('good');
    
    // Needs improvement (100-300ms)
    trackWebVital('FID', 200);
    expect(getWebVitals().FID?.rating).toBe('needs-improvement');
    
    // Poor (> 300ms)
    trackWebVital('FID', 400);
    expect(getWebVitals().FID?.rating).toBe('poor');
  });

  it('should measure timing with startMeasure', async () => {
    const endMeasure = startMeasure('test-operation');
    
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const duration = endMeasure();
    expect(duration).toBeGreaterThan(0);
  });
});
