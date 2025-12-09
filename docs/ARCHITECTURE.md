# Wellio Health - Architecture Overview

*Last Updated: 2025-12-09*

## High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                     │
│  │   Web App    │   │  iOS App     │   │ Android App  │                     │
│  │  (React/PWA) │   │ (Capacitor)  │   │ (Capacitor)  │                     │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                     │
│         └──────────────────┼──────────────────┘                              │
│                    ┌───────▼───────┐                                         │
│                    │   React App   │                                         │
│                    │  + shadcn/ui  │                                         │
│                    │  + TanStack   │                                         │
│                    └───────┬───────┘                                         │
└────────────────────────────┼────────────────────────────────────────────────┘
                             │ HTTPS / WSS
┌────────────────────────────▼────────────────────────────────────────────────┐
│                         LOVABLE CLOUD                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────────┐   │
│  │   Auth       │  │   Storage    │  │    Edge Functions (30+)          │   │
│  │ • Email/Pass │  │ • post-images│  │ • generate-insights              │   │
│  │ • 2FA/TOTP   │  │ • medical-   │  │ • ai-workout-recommendations     │   │
│  │ • Passkeys   │  │   records    │  │ • medical-encrypt                │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────────────┘   │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    PostgreSQL Database + RLS                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐   │  │
│  │  │   Users &   │  │  Fitness &  │  │   Social & Content          │   │  │
│  │  │   Profiles  │  │   Health    │  │   (posts, messages, groups) │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         SECRETS VAULT                                 │  │
│  │  SUPABASE_SERVICE_ROLE_KEY • MEDICAL_ENCRYPTION_KEY • OPENAI_API_KEY │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────────────────┐
│                      EXTERNAL INTEGRATIONS                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Lovable AI  │  │   OpenAI     │  │   Payment    │  │  Wearables   │    │
│  │ Gemini/GPT-5 │  │  Realtime    │  │   Providers  │  │   (Suunto)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │              XX Network (cMix) - Metadata Protection                  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Radix UI, shadcn/ui |
| **State** | TanStack Query (server), Zustand (client) |
| **Routing** | React Router v6 |
| **Backend** | Lovable Cloud (Supabase) |
| **Auth** | Supabase Auth (email, 2FA, passkeys) |
| **Database** | PostgreSQL with RLS |
| **Storage** | Supabase Storage |
| **Edge Functions** | Deno (TypeScript) |
| **i18n** | i18next (23 languages) |
| **PWA** | vite-plugin-pwa, Workbox |
| **Native** | Capacitor (iOS/Android) |
| **Encryption** | @noble/post-quantum (ML-KEM-768), Web Crypto API |
| **AI** | Lovable AI (Gemini, GPT-5), OpenAI Realtime API |

---

## Directory Structure

```
src/
├── assets/              # Static assets (images)
├── components/          # React components (42 subdirectories)
│   ├── activity/        # Activity page components
│   ├── auth/            # Authentication components
│   ├── cart/            # Shopping cart components
│   ├── common/          # Shared/reusable components
│   ├── dashboard/       # Dashboard components
│   ├── fitness/         # Fitness tracking components
│   ├── food/            # Nutrition components
│   ├── layout/          # Layout, Header, Sidebar, Nav
│   ├── locations/       # Wellness directory components
│   ├── medical/         # Medical records components
│   ├── messages/        # Messaging components
│   ├── privacy/         # Privacy controls components
│   ├── settings/        # Settings components
│   ├── social/          # Social features components
│   ├── subscription/    # Premium/subscription components
│   ├── timer/           # Interval timer components
│   ├── ui/              # shadcn/ui base components
│   ├── weight/          # Weight tracking components
│   └── ...              # Other domain directories
├── hooks/               # Custom React hooks (9 domains)
│   ├── auth/            # Authentication hooks
│   ├── encryption/      # Encryption hooks
│   ├── fitness/         # Fitness data hooks
│   ├── locations/       # Location hooks
│   ├── network/         # Network status hooks
│   ├── nutrition/       # Nutrition hooks
│   ├── social/          # Social hooks
│   ├── subscription/    # Subscription hooks
│   ├── ui/              # UI utility hooks
│   ├── utils/           # General utility hooks
│   └── index.ts         # Barrel export
├── i18n/                # Internationalization
│   ├── config.ts        # i18n configuration
│   └── locales/         # Translation files (23 languages)
│       ├── en/          # English (26 namespaces)
│       ├── es/          # Spanish
│       └── ...          # 21 more languages
├── integrations/        # External service integrations
│   └── supabase/        # Supabase client & types
├── lib/                 # Utility functions
│   ├── encryption.ts    # Encryption utilities
│   ├── errorTracking.ts # Error tracking
│   ├── analytics.ts     # Analytics tracking
│   └── ...              # Other utilities
├── pages/               # Page components (109 pages)
│   ├── admin/           # Admin pages
│   └── *.tsx            # All page components
├── routes/              # Routing configuration
│   └── index.tsx        # Route definitions
├── stores/              # Zustand stores
│   └── cartStore.ts     # Shopping cart state
├── test/                # Test utilities
│   ├── setup.ts         # Vitest setup
│   └── utils.tsx        # Test helpers
├── types/               # TypeScript type definitions
│   ├── fitness.types.ts
│   ├── nutrition.types.ts
│   ├── social.types.ts
│   └── index.ts         # Barrel export
└── utils/               # Additional utilities

supabase/
├── config.toml          # Supabase configuration
├── functions/           # Edge functions (Deno)
│   ├── _shared/         # Shared edge function utilities
│   ├── generate-insights/
│   ├── medical-encrypt/
│   ├── predict-injury-risk/
│   └── ...              # Other edge functions
└── migrations/          # Database migrations

docs/                    # Documentation
├── ARCHITECTURE.md      # This file
├── LAUNCH_CHECKLIST.md
├── TESTING_CHECKLIST.md
├── REFACTORING_GUIDE.md
└── ...                  # Other documentation
```

---

## Key Architectural Decisions

### 1. Domain-Driven Component Organization
Components are organized by feature domain, not by type. Each domain has:
- Component files
- `index.ts` barrel export
- Related hooks in `src/hooks/{domain}/`

### 2. Translation-First Development
All UI text uses i18n keys. New features must:
1. Add translation keys to JSON files first
2. Apply changes to ALL 23 languages simultaneously
3. Use `useTranslation` hook in components

### 3. Tiered Encryption Strategy
- **V3 (Quantum-Resistant)**: Medical records, highly sensitive data
- **V2 (AES-256-GCM)**: Messages, PII, payment metadata
- **V1 (Standard RLS)**: General user content

### 4. Premium Feature Visibility
Premium features are visible to all users but gated with `SubscriptionGate`. Free users see upgrade prompts.

### 5. Unified Cart System
All purchasable items (subscriptions, add-ons, products) use a single global cart managed by Zustand.

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     React Components                      │
│  (useTranslation, useSubscription, custom hooks)         │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    TanStack Query                         │
│           (caching, background refetch)                  │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase Client                         │
│        (REST API, Realtime, Storage, Auth)               │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    Edge Functions                         │
│    (AI features, encryption, external APIs)              │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 PostgreSQL + RLS                          │
│          (Row Level Security policies)                   │
└─────────────────────────────────────────────────────────┘
```

---

## Security Architecture

### Authentication Flow
1. User signs up/logs in via Supabase Auth
2. Session managed automatically
3. 30-minute inactivity timeout
4. 2FA with backup codes available
5. Anomaly detection for suspicious activity

### RLS Policies
All tables have Row Level Security policies:
- User data: `auth.uid() = user_id`
- Public data: Explicit allow policies
- Admin data: `has_role(auth.uid(), 'admin')`

### Medical Data Protection
- Re-authentication required for access
- Quantum-resistant encryption (ML-KEM-768)
- Audit logging for all access
- HIPAA-aligned practices

---

## Performance Optimizations

### Bundle Splitting
```typescript
// vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui-vendor': ['@radix-ui/...'],
  'query-vendor': ['@tanstack/react-query'],
  'supabase-vendor': ['@supabase/supabase-js'],
  'chart-vendor': ['recharts'],
}
```

### Lazy Loading
All page components are lazy-loaded via React.lazy().

### Caching Strategy
- TanStack Query: 5-minute stale time
- PWA: NetworkFirst for API, CacheFirst for assets
- localStorage: Subscription status for instant UI

---

## Testing Strategy

### Unit Tests
- Component tests with Vitest + Testing Library
- Hook tests with renderHook
- Utility function tests

### Integration Tests
- Critical user flows
- API integration tests

### Manual Testing
- See `docs/TESTING_CHECKLIST.md`

---

## Monitoring & Observability

| Utility | Location | Purpose |
|---------|----------|---------|
| Error Tracking | `src/lib/errorTracking.ts` | Log errors to database |
| Analytics | `src/lib/analytics.ts` | Track user events |
| Performance | `src/lib/performanceMonitoring.ts` | Core Web Vitals |

*Note: Connect to production providers (Sentry, Mixpanel) before launch.*

---

## Deployment

### Frontend
- Lovable handles deployment automatically
- PWA assets generated on build
- Source maps in development only

### Backend
- Edge functions deploy automatically
- Database migrations via Lovable Cloud
- Secrets managed in Lovable Cloud

### Native Apps
- Capacitor builds for iOS/Android
- See `docs/APP_STORE_PREP.md`
