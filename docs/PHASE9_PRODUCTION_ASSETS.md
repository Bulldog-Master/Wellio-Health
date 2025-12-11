# Wellio — Phase 9: Production-Ready Assets

## Concrete, Copy-Pasteable Assets for Immediate Use

---

## 1️⃣ Next.js Landing Page – Production-Style Starter

Assumes Next.js 13+ with App Router and TailwindCSS.

---

### app/layout.tsx

```tsx
// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wellio – Wellness APP Platform",
  description:
    "Privacy-first Wellness APP Platform for individuals, with optional support from trainers, coaches, and clinicians.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0D0F14] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
```

---

### app/page.tsx

```tsx
// app/page.tsx
import Hero from "@/components/Hero";
import FWISection from "@/components/FWISection";
import ProfessionalsSection from "@/components/ProfessionalsSection";
import SecuritySection from "@/components/SecuritySection";
import PricingSection from "@/components/PricingSection";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <FWISection />
      <ProfessionalsSection />
      <SecuritySection />
      <PricingSection />
      <CTA />
      <Footer />
    </main>
  );
}
```

---

### components/Hero.tsx

```tsx
// components/Hero.tsx
export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/10" />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Your Health.{" "}
          <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
            Your Privacy.
          </span>
          <br />
          Your Control.
        </h1>
        
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          AI-powered wellness intelligence with post-quantum encryption and 
          metadata protection. Your data never leaves your device.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#download"
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full font-semibold hover:opacity-90 transition"
          >
            Download App
          </a>
          <a
            href="#learn"
            className="px-8 py-4 border border-white/20 rounded-full font-semibold hover:bg-white/5 transition"
          >
            Learn More
          </a>
        </div>
      </div>
      
      {/* Phone mockup placeholder */}
      <div className="absolute right-0 bottom-0 w-1/3 hidden lg:block">
        <div className="w-64 h-[500px] bg-gradient-to-b from-violet-600/30 to-cyan-500/30 rounded-3xl mx-auto" />
      </div>
    </section>
  );
}
```

---

### components/FWISection.tsx

```tsx
// components/FWISection.tsx
export default function FWISection() {
  return (
    <section className="py-24 px-6" id="fwi">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your{" "}
            <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
              FWI Score
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            One score that tells you how you're really doing. Track sleep, meals, 
            hydration, movement, and mood — all privately.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* FWI Ring visualization */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 rounded-full border-8 border-violet-600/30" />
              <div className="absolute inset-4 rounded-full border-8 border-cyan-500/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold">78</span>
              </div>
            </div>
          </div>
          
          {/* Metrics */}
          <div className="space-y-6">
            {[
              { label: "Sleep", value: "7.5h", color: "bg-violet-500" },
              { label: "Meals", value: "3/4", color: "bg-cyan-500" },
              { label: "Hydration", value: "2.1L", color: "bg-blue-500" },
              { label: "Movement", value: "8,432", color: "bg-green-500" },
              { label: "Mood", value: "Good", color: "bg-amber-500" },
            ].map((metric) => (
              <div key={metric.label} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${metric.color}`} />
                <span className="text-gray-400 w-24">{metric.label}</span>
                <span className="font-semibold">{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### components/SecuritySection.tsx

```tsx
// components/SecuritySection.tsx
import { Shield, Lock, Eye } from "lucide-react";

export default function SecuritySection() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-transparent to-violet-950/20" id="security">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Post-Quantum{" "}
            <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
              Security
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Protected with ML-KEM-768 encryption and cMixx metadata elimination.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "On-Device Storage",
              description: "Your data never leaves your device. No cloud uploads, no server storage.",
            },
            {
              icon: Lock,
              title: "PQ Encryption",
              description: "ML-KEM-768 post-quantum cryptography protects against future threats.",
            },
            {
              icon: Eye,
              title: "cMixx Protection",
              description: "xx Network's mixnet eliminates metadata leakage completely.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition"
            >
              <feature.icon className="w-12 h-12 text-violet-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### components/ProfessionalsSection.tsx

```tsx
// components/ProfessionalsSection.tsx
export default function ProfessionalsSection() {
  return (
    <section className="py-24 px-6" id="professionals">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Professional Support,{" "}
            <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
              Your Choice
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Invite trainers or clinicians. They see insights only — never your raw data.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Trainers/Coaches */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-600/20 to-transparent border border-violet-500/30">
            <h3 className="text-2xl font-bold mb-4">For Coaches</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> FWI trends & adherence
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Workout readiness signals
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Secure video sessions
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span> No raw meal logs
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span> No personal diaries
              </li>
            </ul>
          </div>
          
          {/* Clinicians */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-transparent border border-cyan-500/30">
            <h3 className="text-2xl font-bold mb-4">For Clinicians</h3>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> Functional patterns
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> 30-day behavioral trends
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span> E2E encrypted messaging
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span> No PHI exposure
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span> No raw health logs
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

### components/PricingSection.tsx

```tsx
// components/PricingSection.tsx
export default function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Core wellness tracking",
      features: [
        "FWI daily score",
        "Basic logging",
        "On-device storage",
        "PQ encryption",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$9.99",
      period: "/month",
      description: "Advanced insights & AI",
      features: [
        "Everything in Free",
        "AI recommendations",
        "Trend analysis",
        "Professional invites",
        "Medical vault",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For organizations",
      features: [
        "Everything in Pro",
        "Team management",
        "Admin dashboard",
        "Priority support",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  return (
    <section className="py-24 px-6" id="pricing">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple{" "}
            <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-gray-400">
            Start free. Upgrade when you're ready.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`p-8 rounded-2xl ${
                plan.highlighted
                  ? "bg-gradient-to-b from-violet-600/30 to-cyan-600/10 border-2 border-violet-500"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-gray-400">{plan.period}</span>
                )}
              </div>
              <p className="text-gray-400 mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-full font-semibold transition ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 hover:opacity-90"
                    : "border border-white/20 hover:bg-white/5"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

---

### components/CTA.tsx

```tsx
// components/CTA.tsx
export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ready to Take Control?
        </h2>
        <p className="text-xl text-gray-400 mb-8">
          Join thousands who've chosen wellness without surveillance.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#"
            className="px-8 py-4 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-full font-semibold hover:opacity-90 transition inline-flex items-center gap-2"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            App Store
          </a>
          <a
            href="#"
            className="px-8 py-4 border border-white/20 rounded-full font-semibold hover:bg-white/5 transition inline-flex items-center gap-2"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h15c.83 0 1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5h-15c-.83 0-1.5-.67-1.5-1.5zm12.5-3l-4.5-7.5-4.5 7.5h9zm-7-11l4.5 7.5 4.5-7.5h-9z" />
            </svg>
            Google Play
          </a>
        </div>
      </div>
    </section>
  );
}
```

---

### components/Footer.tsx

```tsx
// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/10">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-xl mb-4">Wellio</h3>
            <p className="text-gray-400 text-sm">
              Privacy-first wellness intelligence.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">Features</a></li>
              <li><a href="#" className="hover:text-white">Pricing</a></li>
              <li><a href="#" className="hover:text-white">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">About</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
              <li><a href="#" className="hover:text-white">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 Wellio. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white">LinkedIn</a>
            <a href="#" className="text-gray-400 hover:text-white">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

---

### globals.css

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --background: #0D0F14;
  --foreground: #FFFFFF;
  --primary: #7C3AED;
  --accent: #22D3EE;
}

body {
  background: var(--background);
  color: var(--foreground);
}

/* Gradient text utility */
.gradient-text {
  @apply bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent;
}

/* Glow effects */
.glow-violet {
  box-shadow: 0 0 40px rgba(124, 58, 237, 0.3);
}

.glow-cyan {
  box-shadow: 0 0 40px rgba(34, 211, 238, 0.3);
}
```

---

*Next.js landing page scaffold complete — ready to copy and deploy.*

*Last updated: December 2024*
