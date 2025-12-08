/**
 * Analytics Utility
 * Tracks user events and page views
 */

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

interface PageView {
  path: string;
  title: string;
  referrer?: string;
  timestamp: number;
}

// In-memory event queue (replace with actual analytics provider in production)
const eventQueue: AnalyticsEvent[] = [];
const pageViews: PageView[] = [];

/**
 * Track a custom event
 */
export function trackEvent(event: string, properties?: Record<string, unknown>): void {
  const analyticsEvent: AnalyticsEvent = {
    event,
    properties,
    timestamp: Date.now(),
  };
  
  eventQueue.push(analyticsEvent);
  
  if (import.meta.env.DEV) {
    console.log('📊 Event:', event, properties);
  }
  
  // TODO: Send to analytics provider (e.g., Mixpanel, Amplitude, PostHog)
}

/**
 * Track a page view
 */
export function trackPageView(path: string, title: string): void {
  const pageView: PageView = {
    path,
    title,
    referrer: typeof document !== 'undefined' ? document.referrer : undefined,
    timestamp: Date.now(),
  };
  
  pageViews.push(pageView);
  
  if (import.meta.env.DEV) {
    console.log('📄 Page View:', path, title);
  }
  
  // TODO: Send to analytics provider
}

/**
 * Identify a user
 */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.log('👤 Identify:', userId, traits);
  }
  
  // TODO: Send to analytics provider
}

/**
 * Reset user identity (on logout)
 */
export function resetIdentity(): void {
  if (import.meta.env.DEV) {
    console.log('🔄 Identity Reset');
  }
  
  // TODO: Reset analytics provider identity
}

/**
 * Common event tracking helpers
 */
export const Analytics = {
  // Authentication events
  signUp: () => trackEvent('user_signed_up'),
  signIn: () => trackEvent('user_signed_in'),
  signOut: () => trackEvent('user_signed_out'),
  
  // Feature usage
  featureUsed: (feature: string) => trackEvent('feature_used', { feature }),
  
  // Premium events
  subscriptionStarted: (tier: string) => trackEvent('subscription_started', { tier }),
  subscriptionCancelled: (tier: string) => trackEvent('subscription_cancelled', { tier }),
  addOnPurchased: (addOn: string) => trackEvent('addon_purchased', { addOn }),
  
  // Fitness events
  workoutLogged: (type: string, duration: number) => 
    trackEvent('workout_logged', { type, duration }),
  mealLogged: (mealType: string) => 
    trackEvent('meal_logged', { mealType }),
  weightLogged: (weight: number) => 
    trackEvent('weight_logged', { weight }),
  stepsLogged: (steps: number) => 
    trackEvent('steps_logged', { steps }),
  
  // Social events
  postCreated: () => trackEvent('post_created'),
  postLiked: () => trackEvent('post_liked'),
  commentAdded: () => trackEvent('comment_added'),
  userFollowed: () => trackEvent('user_followed'),
  
  // Error events
  errorOccurred: (errorType: string) => 
    trackEvent('error_occurred', { errorType }),
  
  // Performance events
  slowPageLoad: (path: string, duration: number) => 
    trackEvent('slow_page_load', { path, duration }),
};

/**
 * Get event queue (for debugging)
 */
export function getEventQueue(): AnalyticsEvent[] {
  return [...eventQueue];
}

/**
 * Get page views (for debugging)
 */
export function getPageViews(): PageView[] {
  return [...pageViews];
}

/**
 * Initialize analytics
 */
export function initAnalytics(): void {
  if (import.meta.env.DEV) {
    console.log('📊 Analytics initialized (development mode)');
  }
  
  // TODO: Initialize analytics provider
}
