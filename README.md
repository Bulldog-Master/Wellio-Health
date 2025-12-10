# Wellio Health

<!-- PROJECT BADGES -->
<p align="center">
  <!-- Status -->
  <img src="https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge" alt="Status: Active" />
  
  <!-- Build Status -->
  <img src="https://img.shields.io/github/actions/workflow/status/Bulldog-Master/Wellio-Health/ci.yml?branch=main&label=build&style=for-the-badge" alt="Build Status" />
  
  <!-- Security Scanning (Dynamic) -->
  <a href="https://github.com/Bulldog-Master/Wellio-Health/security/code-scanning">
    <img src="https://img.shields.io/github/actions/workflow/status/Bulldog-Master/Wellio-Health/codeql.yml?branch=main&label=CodeQL&style=for-the-badge&logo=github&logoColor=white" alt="CodeQL" />
  </a>
  
  <!-- Snyk Vulnerability Scanning -->
  <a href="https://snyk.io/test/github/Bulldog-Master/Wellio-Health">
    <img src="https://snyk.io/test/github/Bulldog-Master/Wellio-Health/badge.svg" alt="Known Vulnerabilities" />
  </a>
  
  <!-- License -->
  <img src="https://img.shields.io/badge/license-Proprietary-lightgrey?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <sub><em>Security badges reflect real-time automated scans via <strong>CodeQL</strong> and <strong>Snyk</strong> on every push and pull request.</em></sub>
</p>

<p align="center">
  <!-- Tech Stack -->
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Supabase-Edge_Secure-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Capacitor-Mobile-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor" />
</p>

<p align="center">
  <!-- Security & Privacy -->
  <img src="https://img.shields.io/badge/Encryption-Quantum_Resistant-blueviolet?style=for-the-badge&logo=shield&logoColor=white" alt="Quantum Resistant Encryption" />
  <img src="https://img.shields.io/badge/AI_Privacy-SAFE-success?style=for-the-badge&logo=lock&logoColor=white" alt="AI Privacy" />
  <img src="https://img.shields.io/badge/Docs-Complete-brightgreen?style=for-the-badge&logo=readme" alt="Documentation Status" />
</p>

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
git clone https://github.com/Bulldog-Master/Wellio-Health.git
cd Wellio-Health

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
```

### Environment Variables

> **📦 Note for Reviewers:** In Lovable projects, `.env` is auto-generated and committed to the repo.  
> This is intentional and safe—it only contains **publishable client-side keys** (e.g., Supabase anon key).  
> All server-side secrets are managed via **Lovable Cloud Secrets** and never exposed in the codebase.  
> See [SECURITY_FAQ.md](docs/SECURITY_FAQ.md) for full details.

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

**Key distinction:**
| Location | Contains | Exposed to Client |
|----------|----------|-------------------|
| `.env` (tracked) | `VITE_*` publishable keys only | ✅ Yes (by design) |
| Lovable Cloud Secrets | Service keys, API secrets, encryption keys | ❌ Never |

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

## 🧑‍⚕️ Care Team Architecture

Wellio is not a solo fitness app — it's a privacy-preserving human performance platform. Users can connect with coaches and clinicians who support their training and wellness goals.

### What Professionals Can See

| Role | Access | Restrictions |
|------|--------|--------------|
| **Coach** | Functional wellness index, adherence, workout readiness trends | No meal notes, raw logs, or chat metadata |
| **Clinician** | Functional index + 30-day patterns | No diagnosis, no PHI, no raw diaries |

Users approve every relationship from the **Care Team** screen and can revoke access at any time.

> **No raw data or medical documents are exposed to professionals — only derived, privacy-preserving wellness indicators.**

### Zero-Trust by Design

- **Data minimization**: We never store plaintext logs on the server
- **Per-relationship access**: Fine-grained consent at the user level
- **Score versioning**: Historical data retains meaning even as formulas evolve
- **Secure messaging**: Built for post-quantum encryption and cMix routing

This architecture enables **clinical relevance without clinical liability**.

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

Comprehensive documentation is available in the `/docs` directory. See [**docs/INDEX.md**](docs/INDEX.md) for the complete index.

### Key Documents

| Category | Documents |
|----------|-----------|
| **Security** | [Security Audit](docs/SECURITY_AUDIT.md) · [Security FAQ](docs/SECURITY_FAQ.md) · [AI Privacy](docs/AI_PRIVACY.md) |
| **Architecture** | [Architecture](docs/ARCHITECTURE.md) · [Domain Architecture](docs/DOMAIN_ARCHITECTURE.md) |
| **Launch** | [Launch Checklist](docs/LAUNCH_CHECKLIST.md) · [Testing Checklist](docs/TESTING_CHECKLIST.md) |
| **Compliance** | [ISO Compliance](docs/ISO_COMPLIANCE.md) · [Accessibility](docs/ACCESSIBILITY.md) |
| **i18n** | [Translation Guide](docs/TRANSLATION_GUIDE.md) · [Translation Audit](docs/TRANSLATION_AUDIT_FINAL.md) |

### For External Reviewers

- **Security concerns?** See [SECURITY_FAQ.md](docs/SECURITY_FAQ.md) - explains `.env` file, key management, and common questions
- **AI/Privacy?** See [AI_PRIVACY.md](docs/AI_PRIVACY.md) - data handling, anonymization, and what's never sent to AI

## 🤝 Contributing

This project is currently in private development. Contribution guidelines will be published when the project opens for contributions.

## ⚠️ Disclaimer

**Wellio Health is a wellness and fitness tracking tool, not a medical device.**

- This application does not provide medical diagnosis, treatment, or professional health advice
- Always consult qualified healthcare professionals for medical decisions
- Medical records storage is for personal organization only
- AI-powered insights are informational suggestions, not medical recommendations
- The app is designed to align with GDPR, HIPAA, and CCPA principles but has not undergone formal regulatory certification

By using this application, you acknowledge that it is a wellness tool and not a substitute for professional medical care.

## 📄 License

Proprietary. All rights reserved.

---

Built with ❤️ using [Lovable](https://lovable.dev)
