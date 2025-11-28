# Subscription System Guide

## Overview

A complete subscription management system has been implemented with three tiers: **Free**, **Pro**, and **Enterprise**. All new users automatically start on the Free tier.

## Current Implementation

### Database Structure

- **subscriptions table**: Stores user subscription data (tier, status, dates)
- **subscription_features table**: Defines what features are available per tier
- **Automatic initialization**: New users get a Free subscription on signup

### Subscription Tiers & Features

#### Free Tier
- Basic workout logging (up to 10 workouts/month)
- Food tracking
- Progress photos
- Community feed
- **Price**: Free forever

#### Pro Tier ($9.99/month)
- Everything in Free
- Unlimited workouts
- ✅ Trainer search & booking
- ✅ Custom challenges
- ✅ Advanced analytics
- ✅ AI-powered insights
- **Price**: $9.99/month

#### Enterprise Tier ($29.99/month)
- Everything in Pro
- ✅ Live workout sessions
- Priority support
- Custom workout programs
- Team collaboration
- API access
- **Price**: $29.99/month

### Feature Gates Implemented

The following pages/features are gated behind subscriptions:

1. **Trainer Marketplace** (`/trainer/marketplace`) - Pro+
2. **Advanced Analytics** (`/analytics`) - Pro+
3. **AI Insights** (`/insights`) - Pro+
4. **Custom Challenge Creation** (`/progress-challenges`) - Pro+
5. **Live Workout Sessions** (`/live-workout-sessions`) - Enterprise only

### UI Components

#### `useSubscription` Hook
Located in `src/hooks/useSubscription.ts`
```typescript
const { tier, hasFeature, getFeatureValue, subscription, isLoading } = useSubscription();
```

#### `<SubscriptionGate>` Component
Wraps entire pages to restrict access:
```tsx
<SubscriptionGate feature="trainer_search">
  <YourComponent />
</SubscriptionGate>
```

#### `<UpgradePrompt>` Component
Shows upgrade CTAs:
```tsx
<UpgradePrompt feature="Advanced Analytics" compact />
```

### User Experience

- **Profile page**: Shows subscription tier badge with upgrade button for free users
- **Settings**: Subscription management link at top of settings menu
- **Dashboard**: Compact upgrade prompt for free users
- **Gated features**: Shows lock screen with upgrade CTA when accessed

## Adding Stripe Payment Processing

When you're ready to accept payments, follow these steps:

### Step 1: Enable Stripe Integration

1. Get your Stripe secret key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. In Lovable, tell the AI: "Enable Stripe integration"
3. The AI will prompt you to securely add your `STRIPE_SECRET_KEY`

### Step 2: Create Products & Prices in Stripe

The AI will automatically:
- Create Stripe products for Pro and Enterprise tiers
- Set up recurring monthly pricing
- Configure webhooks for subscription events

### Step 3: Update Subscription Page

The subscription page (`/subscription`) will be updated to:
- Show Stripe Checkout buttons instead of "Coming Soon"
- Handle successful payment redirects
- Sync subscription status with Stripe

### Step 4: Webhook Handling

Stripe webhooks will automatically:
- Upgrade users when payment succeeds
- Downgrade users when subscription cancels
- Handle payment failures and renewals

## Testing Subscriptions (Without Stripe)

Currently, you can manually change subscription tiers for testing:

```sql
-- Upgrade a user to Pro
UPDATE subscriptions 
SET tier = 'pro', status = 'active'
WHERE user_id = 'user-uuid-here';

-- Upgrade a user to Enterprise
UPDATE subscriptions 
SET tier = 'enterprise', status = 'active'
WHERE user_id = 'user-uuid-here';
```

## Feature Configuration

To add or modify features, update the `subscription_features` table:

```sql
-- Add a new feature to Pro tier
INSERT INTO subscription_features (tier, feature_key, feature_value)
VALUES ('pro', 'new_feature_name', 'true');
```

## Files to Review

- `/src/hooks/useSubscription.ts` - Main subscription hook
- `/src/components/SubscriptionGate.tsx` - Feature gate component
- `/src/components/UpgradePrompt.tsx` - Upgrade CTA component
- `/src/pages/Subscription.tsx` - Subscription management page

## Next Steps

1. **Test the free tier experience** - Create a new account and explore
2. **Test feature gates** - Try accessing Pro/Enterprise features
3. **Customize pricing** - Adjust prices in Subscription.tsx if needed
4. **When ready**: Enable Stripe and go live with payments

## Support

For questions about Stripe integration, refer to:
- [Lovable Stripe Documentation](https://docs.lovable.dev/integrations/stripe)
- [Stripe Documentation](https://stripe.com/docs)
