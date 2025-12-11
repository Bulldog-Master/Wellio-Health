# Wellio — Phase 8: Next.js Website Code Scaffold

## Production-Ready Starter Repository

---

## A. File Structure

```
/wellio-web
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Homepage
│   ├── security/
│   │   └── page.tsx          # Security model
│   ├── professionals/
│   │   └── page.tsx          # Trainer/Clinician overview
│   ├── privacy/
│   │   └── page.tsx          # Privacy policy
│   ├── download/
│   │   └── page.tsx          # App download links
│   └── support/
│       └── page.tsx          # Help center
│
├── components/
│   ├── Hero.tsx
│   ├── FWISection.tsx
│   ├── SecuritySection.tsx
│   ├── ProfessionalsSection.tsx
│   ├── TrustSignals.tsx
│   ├── PricingSection.tsx
│   ├── CTA.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Badge.tsx
│
├── public/
│   ├── mockups/
│   │   ├── today-screen.png
│   │   ├── vault-screen.png
│   │   └── pro-dashboard.png
│   ├── animations/
│   │   ├── fwi-ring.json      # Lottie
│   │   ├── pq-lock.json       # Lottie
│   │   └── cmix-nodes.json    # Lottie
│   ├── icons/
│   └── logo.svg
│
├── styles/
│   └── globals.css
│
├── lib/
│   └── animations.ts
│
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## B. Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 | App Router, SSR/SSG |
| TypeScript | Type safety |
| TailwindCSS | Styling |
| Framer Motion | Animations |
| shadcn/ui | UI components |
| Lottie | Vector animations |

---

## C. Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'hsl(263, 85%, 58%)',      // Violet #7C3AED
          foreground: 'hsl(0, 0%, 100%)',
        },
        accent: {
          DEFAULT: 'hsl(187, 78%, 53%)',       // Cyan #22D3EE
          foreground: 'hsl(0, 0%, 0%)',
        },
        background: 'hsl(240, 10%, 4%)',       // #0A0A0C
        surface: 'hsl(220, 14%, 8%)',          // #121418
        foreground: 'hsl(0, 0%, 100%)',
        muted: {
          DEFAULT: 'hsl(0, 0%, 63%)',
          foreground: 'hsl(0, 0%, 45%)',
        },
      },
      fontFamily: {
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(124, 58, 237, 0.6)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

---

## D. Page Routes

| Route | Purpose | Key Sections |
|-------|---------|--------------|
| `/` | Homepage | Hero, FWI, Security, Professionals, Pricing, CTA |
| `/security` | Security model | PQ encryption, cMixx, zero-trust |
| `/professionals` | Pro overview | Coach benefits, Clinician benefits |
| `/privacy` | Privacy policy | Legal compliance |
| `/download` | App links | iOS, Android, Web app |
| `/support` | Help center | FAQ, Contact |

---

## E. Hero Section Component

```tsx
// components/Hero.tsx
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from './ui/Button'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/10" />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-6"
        >
          Your Health. Your Privacy.
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {' '}Your Control.
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-body text-xl text-muted max-w-2xl mx-auto mb-8"
        >
          AI-powered wellness intelligence with post-quantum encryption 
          and metadata protection. Your data never leaves your device.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="gradient" size="lg">
            Download App
          </Button>
          <Button variant="outline" size="lg">
            Learn More
          </Button>
        </motion.div>
      </div>
      
      {/* Phone Mockup */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="absolute bottom-0 right-0 w-1/3 hidden lg:block"
      >
        <Image 
          src="/mockups/today-screen.png"
          alt="Wellio Today Screen"
          width={400}
          height={800}
          className="drop-shadow-2xl"
        />
      </motion.div>
    </section>
  )
}
```

---

## F. Animation Integration

### Framer Motion + Lottie
Use Framer Motion or Lottie React to embed PQ lock and cMixx animations.

### Lottie Animations
- PQ lock mechanism animation
- cMixx node swirl animation
- FWI ring draw animation

### Implementation Example
```tsx
import Lottie from 'lottie-react'
import { motion, useInView } from 'framer-motion'
import pqLockAnimation from '@/public/animations/pq-lock.json'
import cmixNodesAnimation from '@/public/animations/cmix-nodes.json'

// Scroll-triggered FWI animation
function FWISection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <Lottie animationData={fwiRingAnimation} loop={false} />
    </motion.div>
  )
}

// PQ Lock animation
function SecuritySection() {
  return (
    <div className="flex gap-8">
      <Lottie animationData={pqLockAnimation} loop={false} />
      <Lottie animationData={cmixNodesAnimation} loop={true} />
    </div>
  )
}

<Lottie 
  animationData={pqLockAnimation}
  loop={false}
  autoplay={true}
/>
```

---

## G. Homepage Code Template

```tsx
// app/page.tsx
import { Hero } from '@/components/Hero'
import { FWISection } from '@/components/FWISection'
import { ProfessionalsSection } from '@/components/ProfessionalsSection'
import { SecuritySection } from '@/components/SecuritySection'
import { CTA } from '@/components/CTA'

export default function Home() {
  return (
    <main className="bg-black text-white">
      <Hero />
      <FWISection />
      <ProfessionalsSection />
      <SecuritySection />
      <CTA />
    </main>
  );
}
```

---

## H. SEO Configuration

```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wellio — Privacy-First Wellness APP Platform',
  description: 'AI-powered wellness with post-quantum encryption and cMixx metadata protection. Your health data stays private.',
  keywords: ['wellness', 'privacy', 'health tracking', 'post-quantum', 'encryption'],
  openGraph: {
    title: 'Wellio — Your Health. Your Privacy. Your Control.',
    description: 'The first wellness platform with true data sovereignty.',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wellio',
    description: 'Privacy-first wellness intelligence.',
  },
}
```

---

## H. Dependencies

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.0",
    "lottie-react": "^2.4.0",
    "@radix-ui/react-slot": "^1.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0"
  }
}
```

---

*Website scaffold is production-ready.*

*Last updated: December 2024*
