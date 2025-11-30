# User Access Guide - Referral & Rewards System

## Where Can Users See Their Referral Info & Points?

### 🎯 Primary Access Points

#### 1. **Settings Menu** (Most Prominent)
**Path**: Bottom Nav → Settings → Referral Program card

**What Users See**:
- **Live Points Balance** badge (e.g., "150 pts")
- **Detailed Stats** in description:
  - Current points total
  - Total referrals made
  - Number of active users
- **Example**: "150 points • 3 referrals • 2 active"

**Also in Settings**:
- **Rewards Store** card showing:
  - Your current points balance
  - "Can Redeem!" badge if you have 500+ points
  - Direct link to browse rewards

#### 2. **Profile Page** (Prominent Card)
**Path**: Bottom Nav → Settings → Profile OR Direct `/profile`

**What Users See**:
- **Large Gradient Card** (only shows if you have points):
  - Giant display: "Your Reward Points"
  - **Huge number**: Your points total (e.g., "150 Points")
  - Status message:
    - If 500+ pts: "🎉 You can redeem rewards!"
    - If <500 pts: "Earn X more for your first reward"
  - **Quick Actions**:
    - "Rewards Store" button → Browse rewards
    - "Earn More" button → Go to referral program

**Mobile**: Card shows at top of profile, super visible!

#### 3. **Referral Program Page**
**Path**: Settings → Referral Program

**What Users See**:
- **Stats Cards** (3 large cards):
  - Total Referrals count
  - **Reward Points** (big number)
  - Active Users count
- **How It Works** section explaining earning
- **What Can You Get With Points** section showing:
  - Subscription rewards (500-5000 pts)
  - Badges (100-2000 pts)
  - Features (200-1000 pts)
  - Marketplace perks (300-1000 pts)
- **Quick Access Buttons** at top:
  - "Rewards Store" button
  - "History" button

#### 4. **Rewards Store Page**
**Path**: Settings → Rewards Store OR `/rewards`

**What Users See**:
- **Big Balance Card** at top:
  - "Your Balance: X Points" in huge text
  - Active rewards count
- **Full Catalog** of 13+ rewards across 4 categories
- **Affordability Indicators**:
  - Rewards you can afford: Bright & clickable
  - Rewards you can't afford yet: Dimmed
  - Already owned: "Active" badge

#### 5. **Points History Page**
**Path**: Referral → History button OR `/points-history`

**What Users See**:
- **Summary Cards** (3 cards):
  - Current Balance
  - Total Earned (all time)
  - Total Spent (all time)
- **Transaction List**:
  - Every point earned with description
  - Every point spent with reward name
  - Dates and times
  - Color coded (green = earned, red = spent)

---

## Quick Navigation Paths

### From Anywhere in App:
1. **Settings** (bottom nav) → **Referral Program** → See stats
2. **Settings** (bottom nav) → **Rewards Store** → See balance & shop
3. **Profile** (via Settings) → **Points Card** (if have points) → Click for rewards

### Mobile Users:
- All cards are **tap-to-navigate**
- Points display prominently in Settings menu
- Profile card shows at top for easy access

---

## What Information Is Displayed Where?

### Points Balance Shown In:
- ✅ Settings Menu (badge + description)
- ✅ Profile Page (giant card if >0 points)
- ✅ Referral Page (stats card)
- ✅ Rewards Store (huge balance display)
- ✅ Points History (summary card)

### Referral Stats Shown In:
- ✅ Settings Menu (brief description)
- ✅ Referral Page (detailed cards)

### Earning Info Shown In:
- ✅ Referral Page ("How It Works" + rewards grid)
- ✅ Rewards Store (catalog with costs)

### Transaction History:
- ✅ Points History Page (complete log)

---

## User Experience Flow

### New User (0 points):
1. See Settings → Referral Program (no badge yet)
2. Click → See "Share Your Link" + earning explanation
3. Learn: 50pts signup + 100pts onboarding = 150pts per referral

### User with Points (1-499):
1. See Settings → Referral Program with **"X pts"** badge
2. See Profile → **No card yet** (only shows at 500+ for redemption)
3. Click Referral → See points total + "Earn X more for first reward"

### User Ready to Redeem (500+):
1. See Settings → Referral Program **"X pts"** badge
2. See Settings → Rewards Store **"Can Redeem!"** badge
3. See Profile → **Giant card**: "🎉 You can redeem rewards!"
4. Multiple clear paths to Rewards Store
5. Browse → Redeem → Instant activation!

---

## Design Decisions

### Why These Locations?

1. **Settings Menu**: Central hub users check frequently
2. **Profile**: Personal dashboard where achievements live
3. **Prominent Badges**: Immediate visibility of balance
4. **Direct Descriptions**: No clicking needed to see stats
5. **Multiple Entry Points**: Users can access from anywhere

### Progressive Disclosure:
- **No points**: Show earning info
- **Some points**: Show balance + progress to goal
- **Enough points**: Show celebration + redemption options

### Visual Hierarchy:
- **Largest**: Points balance displays
- **Medium**: Earning opportunities & stats
- **Small**: Transaction history details
