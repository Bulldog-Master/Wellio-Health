# Rewards & Points System

## Overview

The rewards system allows users to earn points through referrals and redeem them for valuable benefits like subscription upgrades, badges, features, and marketplace perks.

## How to Earn Points

### Referral Program
| Action | Points | Description |
|--------|--------|-------------|
| New user signs up | **50 pts** | Awarded when someone creates an account using your referral link |
| New user welcome bonus | **25 pts** | New user receives welcome bonus |
| Referred user completes onboarding | **100 pts** | Awarded when your referred user finishes onboarding |
| Onboarding completion bonus | **50 pts** | New user receives bonus for completing onboarding |

**Total potential per referral:** 150 points (50 signup + 100 onboarding completion)

### Future Point Opportunities
- User stays active for 30 days: +200 pts
- Referred user subscribes to Pro: +500 pts
- Monthly activity streak bonuses
- Special event multipliers

## Reward Catalog

### 💎 Subscription Rewards
- **1 Month Pro** - 500 points
- **3 Months Pro** - 1,000 points (33% savings!)
- **6 Months Pro** - 2,500 points (58% savings!)
- **1 Year Pro** - 5,000 points (67% savings!)

### 🏆 Badge Rewards
- **Verified Badge** - 100 points (Permanent)
- **Elite Trainer Badge** - 1,000 points (Permanent)
- **Community Leader Badge** - 2,000 points (Permanent)

### ⚡ Feature Unlocks
- **Profile Boost** - 200 points (7 days featured)
- **Premium Templates** - 500 points (30 days access)
- **Advanced Analytics** - 1,000 points (Permanent access)

### 📈 Marketplace Benefits
- **Featured Trainer** - 300 points (1 week top placement)
- **Priority Listing** - 500 points (1 month priority)
- **Premium Trainer Status** - 1,000 points (Permanent badge & benefits)

## How Redemption Works

1. **Browse Rewards Store** - Visit `/rewards` to see all available rewards
2. **Check Your Balance** - Current points shown at top of rewards page
3. **Select Reward** - Click "Redeem" on any reward you can afford
4. **Confirm Purchase** - Review details and confirm redemption
5. **Instant Activation** - Reward applies immediately

### Subscription Rewards
- Extends your Pro subscription period
- If you have an active subscription, adds time to the end
- If you're on Free tier, activates Pro immediately
- Multiple redemptions stack (e.g., 2x 1-month = 2 months Pro)

### Feature Rewards
- Time-limited features expire after duration
- Permanent features never expire
- Can be redeemed multiple times if time-limited

### Badge Rewards
- Instantly visible on your profile
- Permanent (never expire)
- Can only be redeemed once

## Points Transaction History

Track all your points activity at `/points-history`:
- See all earned points with descriptions
- Review all spent points on rewards
- View current balance vs lifetime earned/spent
- Filter by transaction type

## Integration Points

### Database Tables
- `rewards` - Catalog of available rewards
- `reward_redemptions` - User redemption records
- `points_transactions` - Complete points history

### Functions
- `redeem_reward(_reward_id)` - Redeem a reward
- `award_referral_points(_user_id, _amount, _description, _related_id)` - Award points
- `has_active_reward(_user_id, _feature_type)` - Check active rewards

### Components
- `SubscriptionGate` - Now checks both subscription tier AND reward redemptions
- Premium features accessible via points OR subscription

## Security

- RLS policies ensure users only see their own redemptions
- Point deduction is atomic (prevents double spending)
- Reward activation happens in same transaction
- All transactions logged for audit trail

## Best Practices

### For Users
1. Share referral link early and often
2. Help referred users complete onboarding (both get bonuses!)
3. Save points for high-value rewards (subscription upgrades)
4. Check rewards store regularly for new offerings

### For Trainers
1. Use referrals to grow client base
2. Redeem marketplace perks to boost visibility
3. Premium trainer status shows professionalism
4. Feature slots increase booking rates

### For Creators
1. Community leader badge builds authority
2. Profile boosts increase follower growth
3. Save points for long-term subscription access

## Future Enhancements

### Gamification
- [ ] Monthly leaderboard for top referrers
- [ ] Streak bonuses for consistent activity
- [ ] Team challenges (trainers vs creators)
- [ ] Limited-time 2x point events

### Redemption Options
- [ ] Gift points to friends
- [ ] Donate points to fundraisers
- [ ] Convert points to trainer service credits
- [ ] Exclusive reward drops for high earners

### Tracking
- [ ] Email notifications for point milestones
- [ ] Push notifications for reward opportunities
- [ ] Monthly performance summary
- [ ] Referral source tracking (social vs email)
