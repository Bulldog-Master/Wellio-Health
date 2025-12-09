# Domain Architecture

This document defines clear domain boundaries within Wellio Health, separating concerns for maintainability, security, and potential future modularization.

## Domain Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           WELLIO HEALTH                                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │ CORE WELLNESS│  │   SOCIAL     │  │   MEDICAL    │  │  ENTERPRISE  ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐│
│  │  NUTRITION   │  │   RECOVERY   │  │   PAYMENTS   │  │  COMPLIANCE  ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Core Wellness Domain

**Purpose**: Primary fitness and health tracking functionality.

### Components
- Activity logging (workouts, steps, weight)
- Habit tracking
- Interval timers
- Fitness goals and progress
- AI workout companion
- Predictive injury prevention
- Emotion-fitness correlation

### Directory Structure
```
src/
├── components/activity/
├── components/fitness/
├── components/timer/
├── components/weight/
├── hooks/fitness/
├── pages/
│   ├── Activity.tsx
│   ├── Workout.tsx
│   ├── StepCount.tsx
│   └── Habits.tsx
```

### Database Tables
- `activity_logs`
- `habits`
- `habit_completions`
- `fitness_events`
- `body_measurements`
- `weight_logs`

### Security Level
- **RLS**: User-owned data only
- **Encryption**: Standard (v1)
- **Public Access**: None

---

## 2. Social Domain

**Purpose**: Community features, social interactions, and gamification.

### Components
- Posts and feed
- Comments and likes
- Follows and connections
- Groups
- Challenges and leaderboards
- Live workout sessions
- Fundraisers

### Directory Structure
```
src/
├── components/social/
├── components/feed/
├── hooks/social/
├── pages/
│   ├── Feed.tsx
│   ├── Groups.tsx
│   ├── Challenges.tsx
│   └── Leaderboard.tsx
```

### Database Tables
- `posts`
- `comments`
- `likes`
- `follows`
- `groups`
- `group_members`
- `challenges`
- `challenge_participants`
- `leaderboard_entries`

### Security Level
- **RLS**: Mixed (public posts, private messages)
- **Encryption**: E2E for messages (v2)
- **Public Access**: Public posts/profiles (when enabled)

---

## 3. Medical Domain

**Purpose**: Health records, medical data, and HIPAA-sensitive information.

### Components
- Medical records storage
- Test results tracking
- Symptoms logging
- Medications management
- HIPAA authorizations
- Medical audit logging

### Directory Structure
```
src/
├── components/medical/
├── hooks/encryption/
├── lib/
│   ├── encryption.ts
│   ├── quantumEncryption.ts
│   └── medicalEncryption.ts
├── pages/
│   ├── MedicalHistory.tsx
│   ├── Symptoms.tsx
│   └── Medications.tsx
```

### Database Tables
- `medical_records`
- `medical_test_results`
- `symptoms`
- `medications`
- `medical_audit_log`
- `hipaa_authorizations`

### Security Level
- **RLS**: User-owned + designated professionals only
- **Encryption**: Quantum-resistant (v3) for sensitive fields
- **Public Access**: NEVER
- **Audit**: Full access logging
- **Re-authentication**: Required for access

---

## 4. Nutrition Domain

**Purpose**: Food tracking, meal planning, and dietary management.

### Components
- Food logging
- Receipt scanning
- Meal planning
- AI nutrition analysis
- Recipes

### Directory Structure
```
src/
├── components/food/
├── components/nutrition/
├── hooks/nutrition/
├── pages/
│   ├── Food.tsx
│   ├── FoodLog.tsx
│   ├── MealPlanner.tsx
│   └── Recipes.tsx
```

### Database Tables
- `nutrition_logs`
- `meal_plans`
- `recipes`

### Security Level
- **RLS**: User-owned data only
- **Encryption**: Standard (v1)
- **Public Access**: None

---

## 5. Recovery Domain

**Purpose**: Recovery therapy tracking and wellness routines.

### Components
- Recovery session logging
- 10+ therapy types (massage, sauna, cryotherapy, etc.)
- Recovery statistics

### Directory Structure
```
src/
├── components/recovery/
├── pages/
│   └── Recovery.tsx
```

### Database Tables
- `recovery_sessions`

### Security Level
- **RLS**: User-owned data only
- **Encryption**: Standard (v1)
- **Public Access**: None

---

## 6. Enterprise Domain

**Purpose**: Professional services and B2B features.

### Components
- Trainer/Coach Portal
- Practitioner Portal
- Professional applications
- Client management
- Booking system

### Directory Structure
```
src/
├── components/professional/
├── pages/
│   ├── ProfessionalHub.tsx
│   ├── TrainerPortal.tsx
│   └── PractitionerPortal.tsx
```

### Database Tables
- `trainer_profiles`
- `practitioner_profiles`
- `professional_applications`
- `bookings`
- `trainer_programs`

### Security Level
- **RLS**: Role-based (trainer, practitioner, client)
- **Encryption**: v2 for PII (encrypted email/phone)
- **Public Access**: Public professional profiles only
- **Verification**: Required for professional roles

---

## 7. Payments Domain

**Purpose**: Subscriptions, payments, and billing.

### Components
- Unified cart system
- Multi-provider checkout (Stripe, PayPal, crypto, e-Transfer)
- Subscription management
- Add-ons
- Payment history

### Directory Structure
```
src/
├── components/payments/
├── stores/cartStore.ts
├── pages/
│   ├── OrdersPayments.tsx
│   └── Subscription.tsx
```

### Database Tables
- `subscriptions`
- `subscription_features`
- `subscription_addons`
- `user_addons`
- `payment_transactions`
- `payment_methods`
- `crypto_payments`
- `etransfer_requests`

### Security Level
- **RLS**: User-owned transactions only
- **Encryption**: v2 for payment metadata
- **Public Access**: Never
- **PCI Compliance**: Via payment providers (Stripe, PayPal)

---

## 8. Compliance Domain

**Purpose**: Legal, regulatory, and privacy compliance.

### Components
- Privacy policy
- Terms of service
- Cookie consent
- Data export/deletion
- Age verification
- GDPR/CCPA/HIPAA controls

### Directory Structure
```
src/
├── components/compliance/
├── components/privacy/
├── pages/
│   ├── PrivacyPolicy.tsx
│   ├── Terms.tsx
│   ├── PrivacyControls.tsx
│   └── AccessibilityStatement.tsx
```

### Database Tables
- `cookie_consents`
- `user_privacy_preferences`
- `data_export_requests`
- `account_deletion_requests`
- `age_verifications`

### Security Level
- **RLS**: User-owned preferences
- **Public Access**: Policy documents only

---

## Cross-Domain Dependencies

```
┌─────────────────┐
│  Core Wellness  │◄──────┐
└────────┬────────┘       │
         │                │
         ▼                │
┌─────────────────┐       │
│    Nutrition    │       │ (AI insights combine
└────────┬────────┘       │  fitness + nutrition)
         │                │
         ▼                │
┌─────────────────┐       │
│    Recovery     │───────┘
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│     Social      │◄───►│    Enterprise   │
└─────────────────┘     └─────────────────┘
         │                      │
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│    Payments     │◄───►│    Compliance   │
└─────────────────┘     └─────────────────┘
```

---

## Future Modularization

Each domain is designed to potentially become:
- Separate npm packages (monorepo)
- Independent microservices
- Feature flagged SKUs

### Candidate Packages
1. `@wellio/core` - Fitness tracking essentials
2. `@wellio/social` - Community features
3. `@wellio/medical` - HIPAA-compliant health records
4. `@wellio/enterprise` - Professional services
5. `@wellio/payments` - Subscription/billing

---

## Domain Ownership

| Domain | Primary Tables | Edge Functions | Security Level |
|--------|---------------|----------------|----------------|
| Core Wellness | 6 | 3 | Standard |
| Social | 10 | 2 | Mixed |
| Medical | 6 | 2 | Maximum |
| Nutrition | 3 | 2 | Standard |
| Recovery | 1 | 0 | Standard |
| Enterprise | 5 | 1 | High |
| Payments | 7 | 3 | High |
| Compliance | 5 | 1 | Standard |

---

## Implementation Guidelines

### Adding New Features

1. **Identify the domain** - Which domain does the feature belong to?
2. **Check security requirements** - What encryption/RLS level is needed?
3. **Create in domain directory** - Don't create root-level components
4. **Add translations** - All 23 languages, relevant namespaces
5. **Add tests** - Unit tests for critical logic
6. **Update domain docs** - Keep this document current

### Cross-Domain Features

When a feature spans multiple domains:
1. Create a shared interface in `src/types/`
2. Use domain hooks to fetch data
3. Compose in page-level components
4. Document the dependency

---

*Last updated: 2025-01-XX*
*Next review: Monthly or on major feature additions*
