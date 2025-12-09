import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  trackEvent, 
  trackPageView, 
  identifyUser, 
  resetIdentity,
  Analytics,
  getEventQueue,
  getPageViews 
} from './analytics';

describe('Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should track events', () => {
    trackEvent('test_event', { property: 'value' });
    const queue = getEventQueue();
    
    const lastEvent = queue[queue.length - 1];
    expect(lastEvent.event).toBe('test_event');
    expect(lastEvent.properties).toEqual({ property: 'value' });
  });

  it('should track page views', () => {
    trackPageView('/dashboard', 'Dashboard');
    const views = getPageViews();
    
    const lastView = views[views.length - 1];
    expect(lastView.path).toBe('/dashboard');
    expect(lastView.title).toBe('Dashboard');
  });

  it('should provide analytics helpers', () => {
    // Auth events
    Analytics.signUp();
    Analytics.signIn();
    Analytics.signOut();
    
    const queue = getEventQueue();
    expect(queue.some(e => e.event === 'user_signed_up')).toBe(true);
    expect(queue.some(e => e.event === 'user_signed_in')).toBe(true);
    expect(queue.some(e => e.event === 'user_signed_out')).toBe(true);
  });

  it('should track feature usage', () => {
    Analytics.featureUsed('workout_logging');
    
    const queue = getEventQueue();
    const featureEvent = queue.find(e => e.event === 'feature_used');
    expect(featureEvent?.properties).toEqual({ feature: 'workout_logging' });
  });

  it('should track fitness events', () => {
    Analytics.workoutLogged('running', 30);
    Analytics.mealLogged('breakfast');
    Analytics.weightLogged(180);
    Analytics.stepsLogged(10000);
    
    const queue = getEventQueue();
    expect(queue.some(e => e.event === 'workout_logged')).toBe(true);
    expect(queue.some(e => e.event === 'meal_logged')).toBe(true);
    expect(queue.some(e => e.event === 'weight_logged')).toBe(true);
    expect(queue.some(e => e.event === 'steps_logged')).toBe(true);
  });

  it('should track subscription events', () => {
    Analytics.subscriptionStarted('premium');
    Analytics.subscriptionCancelled('premium');
    Analytics.addOnPurchased('ai_coach');
    
    const queue = getEventQueue();
    expect(queue.some(e => e.event === 'subscription_started')).toBe(true);
    expect(queue.some(e => e.event === 'subscription_cancelled')).toBe(true);
    expect(queue.some(e => e.event === 'addon_purchased')).toBe(true);
  });
});
