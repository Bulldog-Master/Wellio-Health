# Spanish Translation Audit & Implementation Plan

## Translation Status: STARTING

### Overview
This document tracks the comprehensive Spanish translation of the entire Wellio app including:
- Frontend pages (68+ files)
- Components (50+ files)  
- Backend edge functions (13 functions)
- Toast messages
- Error messages
- Validation messages
- Button labels
- Form labels
- Navigation elements

## Phase 1: Core Translation Files ✅
- [x] `/i18n/locales/es/common.json` - Created with base translations
- [x] `/i18n/locales/es/auth.json` - Created with auth translations
- [x] `/i18n/locales/es/fitness.json` - Created with fitness translations
- [x] `/i18n/locales/es/social.json` - Created with social translations
- [x] `/i18n/locales/es/nutrition.json` - Created with nutrition translations

## Phase 2: New Translation Files NEEDED
- [ ] `/i18n/locales/es/profile.json` - Profile, settings, preferences
- [ ] `/i18n/locales/es/messages.json` - Messaging, conversations
- [ ] `/i18n/locales/es/notifications.json` - Notification types and text
- [ ] `/i18n/locales/es/errors.json` - Error messages, validation
- [ ] `/i18n/locales/es/rewards.json` - Points, rewards, referrals
- [ ] `/i18n/locales/es/subscription.json` - Plans, billing, features
- [ ] `/i18n/locales/es/medical.json` - Medical records, health data
- [ ] `/i18n/locales/es/challenges.json` - Challenges, leaderboards

## Phase 3: Pages Translation Status

### Core Pages (Priority 1)
- [ ] **Feed** (`src/pages/Feed.tsx`) - 1167 lines, HIGH priority
  - Post creation UI
  - Comments section
  - Like/share buttons
  - Trending hashtags
  - All toast messages
  
- [ ] **Profile** (`src/pages/Profile.tsx`) - 751 lines
  - Personal info forms
  - Fitness goals
  - Settings collapsibles
  - Upload buttons
  - Validation messages

- [ ] **Dashboard** (`src/pages/Dashboard.tsx`) - PARTIALLY DONE ✅
  - Stats cards
  - Activity summaries
  - Goals tracking

- [ ] **Auth** (`src/pages/Auth.tsx`) - PARTIALLY DONE ✅
  - Login/signup forms
  - 2FA flow
  - Password reset

### Workout & Fitness Pages (Priority 2)
- [ ] **Workout** (`src/pages/Workout.tsx`) - 2530 lines, MASSIVE
  - Exercise library
  - Routine creation
  - Activity logging
  - Sample routines
  - App integration
  - All form labels
  
- [ ] **Food/Nutrition** (`src/pages/Food.tsx`)
- [ ] **FoodLog** (`src/pages/FoodLog.tsx`)
- [ ] **Recipes** (`src/pages/Recipes.tsx`)
- [ ] **MealPlanner** (`src/pages/MealPlanner.tsx`)
- [ ] **Weight** (`src/pages/Weight.tsx`)
- [ ] **BodyMeasurements** (`src/pages/BodyMeasurements.tsx`)
- [ ] **PersonalRecords** (`src/pages/PersonalRecords.tsx`)
- [ ] **ProgressPhotos** (`src/pages/ProgressPhotos.tsx`)

### Social Features (Priority 3)
- [ ] **Messages** (`src/pages/Messages.tsx`)
- [ ] **Conversation** (`src/pages/Conversation.tsx`)  
- [ ] **Notifications** (`src/pages/Notifications.tsx`)
- [ ] **UserProfile** (`src/pages/UserProfile.tsx`)
- [ ] **Groups** (`src/pages/Groups.tsx`)
- [ ] **Stories** (`src/pages/Stories.tsx`)

### Settings & Account (Priority 4)
- [ ] **SettingsMenu** (`src/pages/SettingsMenu.tsx`)
- [ ] **PrivacySecurity** (`src/pages/PrivacySecurity.tsx`)
- [ ] **NotificationSettings** (`src/pages/NotificationSettings.tsx`)
- [ ] **Subscription** (`src/pages/Subscription.tsx`)
- [ ] **Referral** (`src/pages/Referral.tsx`)
- [ ] **RewardsStore** (`src/pages/RewardsStore.tsx`)

### Medical & Health (Priority 5)
- [ ] **MedicalHistory** (`src/pages/MedicalHistory.tsx`)
- [ ] **Medications** (if exists)
- [ ] **Symptoms** (`src/pages/Symptoms.tsx`)

### Remaining Pages (Priority 6)
- [ ] All other 40+ pages

## Phase 4: Components
- [ ] **Navigation** (`src/components/Navigation.tsx`) - DONE ✅
- [ ] **Layout** (`src/components/Layout.tsx`)
- [ ] **ThemeToggle** - Icons, tooltips
- [ ] **LanguageSwitcher** - ALREADY DONE ✅
- [ ] All other 45+ components

## Phase 5: Backend Edge Functions
- [ ] `ai-meal-suggestions/index.ts`
- [ ] `ai-workout-recommendations/index.ts`
- [ ] `generate-insights/index.ts`
- [ ] All other edge functions (10+)
- [ ] Error responses
- [ ] Success messages

## Hardcoded Text Categories Found

### Toast Messages (100+ instances)
- Success toasts: "Profile updated", "Post created", etc.
- Error toasts: "Failed to save", "Missing information", etc.
- Warning toasts: "Too many updates", "Rate limited", etc.
- Info toasts: "Copied!", "Link shared", etc.

### Form Labels (200+ instances)
- Input labels: "Full Name", "Username", "Age", "Height", "Weight"
- Placeholders: "Enter your email", "Type here...", etc.
- Button text: "Save", "Cancel", "Submit", "Delete", etc.

### UI Text (500+ instances)
- Card titles and descriptions
- Menu items
- Dialog headings
- Badge text
- Empty states: "No data yet", "Start tracking", etc.

### Validation & Errors (50+ instances)
- "Missing information"
- "File too large"
- "Invalid format"
- "Rate limited"

## Implementation Strategy

### Step 1: Expand Translation Files
Create comprehensive `.json` files with ALL needed translations organized by category

### Step 2: Update Pages Systematically
Work through pages in priority order:
1. Import `useTranslation`
2. Replace hardcoded strings with `t('key')`
3. Test language switching
4. Move to next page

### Step 3: Update Components
Same process for all shared components

### Step 4: Backend Translations
Update edge functions to return translated responses based on user language

### Step 5: Testing
- Full app walkthrough in Spanish
- Test all features
- Verify no broken strings
- Check layout/overflow issues

## Progress Tracking
- **Total Estimated Strings**: 2000+
- **Translated**: ~150 (7.5%)
- **Remaining**: ~1850 (92.5%)
