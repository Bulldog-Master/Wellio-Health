# Wellio Health

A comprehensive wellness and fitness platform with enterprise-grade security, AI-powered insights, and global accessibility.

## 🎯 What is Wellio Health?

Wellio Health is a privacy-first wellness platform designed for individuals seeking to track, improve, and maintain their health and fitness journey. It provides comprehensive tools for fitness tracking, nutrition management, medical records, and social connection—all protected by quantum-resistant encryption.

**Who is it for?**
- Individuals tracking daily wellness (workouts, nutrition, habits, sleep)
- Users who prioritize privacy and security for their health data
- Global users needing multi-language support (23 languages)
- Those seeking AI-powered fitness and nutrition insights

## ✨ Key Features

### 🏋️ Fitness & Activity
- Workout logging with exercise library and video tutorials
- Step counting and activity tracking
- Habit tracking with streaks and rewards
- Interval timers and live workout sessions
- Progress photos and workout media gallery
- Wearable integration (Suunto, more coming)

### 🥗 Nutrition
- Food logging with AI-powered analysis
- Meal planning and recipes
- Receipt scanner for grocery tracking
- Supplement tracking

### 🏥 Medical & Recovery
- Secure medical records storage (quantum-resistant encryption)
- Medical test results tracking
- Medication management
- Recovery hub with 10+ therapy types
- Symptom tracking

### 👥 Social & Community
- Social feed with posts, likes, and comments
- Group challenges and leaderboards
- Fundraising campaigns
- Trainer/Coach and Practitioner portals
- E2E encrypted messaging with metadata protection

### 🤖 AI-Powered Features
- AI Voice Workout Companion (real-time coaching)
- Predictive Injury Prevention
- Emotion-Fitness Correlation Engine
- Smart nutrition insights and recommendations

### 🔐 Enterprise Security
- **Quantum-Resistant Encryption**: ML-KEM-768 for medical records
- **E2E Encryption**: AES-256-GCM for messages
- **Metadata Protection**: cMix integration for privacy
- **Comprehensive RLS**: Row-level security on all user data
- **Audit Logging**: Full access tracking for sensitive data
- **GDPR/HIPAA/CCPA Compliance**: Built-in privacy controls

### 🌍 Global Accessibility
- 23 languages supported
- RTL language support (Arabic, Hebrew, Urdu)
- WCAG accessibility compliance
- PWA + Native iOS/Android via Capacitor

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **State** | TanStack Query, Zustand |
| **Backend** | Supabase (Postgres, Auth, Storage, Edge Functions) |
| **Mobile** | Capacitor (iOS/Android) |
| **AI** | Lovable AI (Gemini, GPT-5), OpenAI Realtime API |
| **Encryption** | @noble/post-quantum (ML-KEM-768), Web Crypto API |
| **i18n** | i18next (23 languages) |
| **Testing** | Vitest, Testing Library |

## 📁 Project Structure

```
src/
├── components/          # UI components (22+ domain directories)
│   ├── activity/        # Activity tracking components
│   ├── auth/            # Authentication components
│   ├── dashboard/       # Dashboard widgets
│   ├── food/            # Nutrition components
│   ├── layout/          # Layout and navigation
│   ├── medical/         # Medical records
│   ├── messages/        # Messaging with E2E encryption
│   ├── privacy/         # Privacy controls
│   ├── social/          # Social feed components
│   ├── subscription/    # Payment and subscription
│   └── ui/              # shadcn/ui base components
├── hooks/               # Custom hooks (9 domain directories)
│   ├── auth/            # Authentication hooks
│   ├── encryption/      # E2E encryption hooks
│   ├── fitness/         # Fitness data hooks
│   ├── nutrition/       # Nutrition hooks
│   └── social/          # Social features hooks
├── lib/                 # Utilities and helpers
│   ├── encryption.ts    # Tiered encryption (V1-V3)
│   ├── medicalEncryption.ts  # Quantum-resistant medical encryption
│   └── security/        # Security utilities
├── pages/               # Route pages (100+ pages)
├── stores/              # Zustand stores
├── i18n/                # Internationalization (23 languages)
│   ├── locales/         # Translation files
│   └── config.ts        # i18n configuration
└── integrations/        # External service integrations
    └── supabase/        # Supabase client and types

supabase/
├── functions/           # Edge functions (30+ functions)
│   ├── generate-insights/
│   ├── ai-workout-recommendations/
│   ├── medical-encrypt/
│   └── ...
└── migrations/          # Database migrations

docs/                    # Documentation (25+ docs)
├── ARCHITECTURE.md
├── SECURITY_AUDIT.md
├── LAUNCH_CHECKLIST.md
└── ...
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/wellio-health.git
cd wellio-health

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` (note: only contains publishable keys):

```bash
cp .env.example .env
```

The app uses Lovable Cloud for backend services. Secrets are stored securely in Lovable Cloud Secrets, not in the codebase.

### Mobile Development

```bash
# Add platforms
npx cap add ios
npx cap add android

# Sync and open
npx cap sync
npx cap open ios     # Opens in Xcode
npx cap open android # Opens in Android Studio
```

## 🔒 Security Architecture

### Tiered Encryption Strategy

| Level | Algorithm | Use Case |
|-------|-----------|----------|
| **V3** | ML-KEM-768 (Quantum-Resistant) | Medical records, sensitive health data |
| **V2** | AES-256-GCM + PBKDF2 | Messages, PII, payment metadata |
| **V1** | Standard encryption + RLS | Media files, general user content |

### Key Security Features
- ✅ RLS on all user data tables
- ✅ `user_roles` table (not on profiles) to prevent privilege escalation
- ✅ Medical audit logging (`medical_audit_log`)
- ✅ Rate limiting on sensitive operations
- ✅ Session timeout (30 min) with anomaly detection
- ✅ CSP headers and input validation
- ✅ 2FA with backup codes

## 🗺️ Roadmap

### ✅ Completed
- [x] Core fitness tracking (workouts, steps, habits)
- [x] Nutrition logging with AI analysis
- [x] Medical records with quantum-resistant encryption
- [x] 23-language support
- [x] E2E encrypted messaging
- [x] cMix metadata protection integration
- [x] AI Voice Workout Companion
- [x] Predictive Injury Prevention
- [x] Comprehensive compliance framework (GDPR, HIPAA, CCPA)

### 🔄 In Progress
- [ ] Suunto wearable integration (awaiting API credentials)
- [ ] Payment provider integration (Stripe, PayPal)
- [ ] Production monitoring setup

### 📋 Planned
- [ ] Additional wearable integrations (Garmin, Apple Health)
- [ ] Advanced AI coaching features
- [ ] Team/family accounts
- [ ] Telehealth integration

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Security Audit](docs/SECURITY_AUDIT.md)
- [Launch Checklist](docs/LAUNCH_CHECKLIST.md)
- [Translation Guide](docs/TRANSLATION_GUIDE.md)
- [ISO Compliance](docs/ISO_COMPLIANCE.md)
- [Accessibility](docs/ACCESSIBILITY.md)

## 🤝 Contributing

This project is currently in private development. Contribution guidelines will be published when the project opens for contributions.

## 📄 License

Proprietary. All rights reserved.

---

Built with ❤️ using [Lovable](https://lovable.dev)
