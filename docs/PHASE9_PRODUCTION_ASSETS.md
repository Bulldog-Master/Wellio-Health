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

### app/page.tsx (Complete Single-File Landing Page)

```tsx
// app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <WhatIsWellio />
      <FWISection />
      <Architecture />
      <SecuritySection />
      <ProfessionalsSection />
      <CTASection />
      <Footer />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0D0F14] via-black to-[#121827]" />
      <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/40 to-cyan-400/40 blur-3xl" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-20 lg:flex-row lg:py-28">
        <div className="flex-1 space-y-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-300/70">
            WELLIO WELLNESS APP PLATFORM
          </p>
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            A privacy-first <span className="text-cyan-300">Wellness</span> APP
            Platform.
          </h1>
          <p className="max-w-xl text-balance text-base text-gray-300 sm:text-lg">
            Track your wellbeing privately. Invite trainers, coaches, or
            clinicians only when you choose. Your raw logs stay on your device —
            always.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="#download"
              className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-6 py-3 text-sm font-medium text-black shadow-lg shadow-purple-500/30"
            >
              Get the APP
            </Link>
            <Link
              href="#professionals"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/90"
            >
              How professionals connect
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-gray-300">
            <Badge>Post-Quantum Encryption (ML-KEM-768)</Badge>
            <Badge>Metadata Protection (cMixx)</Badge>
            <Badge>Zero-Trust Architecture</Badge>
          </div>
        </div>

        <div className="flex-1">
          {/* Mocked phone card */}
          <div className="mx-auto h-[540px] w-[280px] rounded-[40px] border border-white/10 bg-gradient-to-b from-white/5 to-white/0 p-4 shadow-2xl shadow-black/60">
            <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-white/20" />
            <div className="flex h-full flex-col rounded-[30px] bg-[#020617] p-4">
              <p className="text-xs text-gray-400">Today</p>
              <div className="mt-4 flex flex-col items-center gap-2">
                <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-400/30">
                  <div className="h-32 w-32 rounded-full border-4 border-white/10" />
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xs text-gray-300">FWI</span>
                    <span className="text-4xl font-semibold">78</span>
                    <span className="text-[11px] text-emerald-300">
                      +4 vs yesterday
                    </span>
                  </div>
                </div>
                <p className="text-center text-xs text-gray-400">
                  Functional Wellness Index — your private daily wellness score.
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-gray-200">
                <PhoneCard label="Sleep" value="7h 45m" note="On target" />
                <PhoneCard label="Meals" value="3" note="Balanced" />
                <PhoneCard label="Hydration" value="2.1L" note="Good" />
                <PhoneCard label="Movement" value="8,420" note="Steps" />
                <PhoneCard label="Mood" value="Calm" note="Stable" />
              </div>
              <div className="mt-auto space-y-2 pt-4">
                <p className="text-[11px] text-gray-400">
                  Professionals see trends — never your logs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
      {children}
    </span>
  );
}

function PhoneCard(props: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-2xl bg-white/5 p-2">
      <p className="text-[10px] text-gray-400">{props.label}</p>
      <p className="text-sm font-semibold">{props.value}</p>
      <p className="text-[10px] text-gray-400">{props.note}</p>
    </div>
  );
}

function WhatIsWellio() {
  return (
    <section className="border-b border-white/5 bg-[#020617]">
      <div className="mx-auto max-w-5xl px-6 py-16 space-y-6">
        <h2 className="text-3xl font-semibold">
          A Wellness APP Platform designed around you.
        </h2>
        <p className="max-w-2xl text-gray-300">
          Wellio gives individuals a private, AI-supported way to understand
          their wellbeing. Professionals can connect later — as an optional
          extension — under strict data boundaries.
        </p>
        <ul className="grid gap-3 text-sm text-gray-200 md:grid-cols-2">
          <li>• FWI (Functional Wellness Index) — your private daily score</li>
          <li>• Today at a Glance dashboard</li>
          <li>• Logs for sleep, meals, hydration, movement, and mood</li>
          <li>• Encrypted medical vault for sensitive documents</li>
          <li>• AI wellness guidance — without selling your data</li>
          <li>• Secure messaging & optional video sessions</li>
        </ul>
      </div>
    </section>
  );
}

function FWISection() {
  return (
    <section className="border-b border-white/5 bg-[#020617]">
      <div className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-16 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-semibold">Your Functional Wellness Index.</h2>
          <p className="text-gray-300">
            FWI combines your daily behaviors into one private signal — helping
            you understand how sleep, meals, hydration, movement, and mood work
            together.
          </p>
          <ul className="space-y-2 text-sm text-gray-200">
            <li>• Sleep quality & consistency</li>
            <li>• Meals & hydration adherence</li>
            <li>• Movement & activity balance</li>
            <li>• Mood and stress reflections</li>
          </ul>
          <p className="text-sm text-gray-400">
            FWI lives on your device. Only if you invite a professional do
            derived signals leave your phone — never raw logs.
          </p>
        </div>
        <div className="flex-1">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
            <p className="text-xs text-gray-400">Example FWI breakdown</p>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <Metric label="Sleep" value="82" />
              <Metric label="Meals" value="76" />
              <Metric label="Hydration" value="88" />
              <Metric label="Movement" value="74" />
              <Metric label="Mood" value="80" />
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Professionals see scores like these — not the underlying entries.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-black/40 p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

function Architecture() {
  return (
    <section className="border-b border-white/5 bg-[#020617]">
      <div className="mx-auto max-w-5xl px-6 py-16 space-y-6">
        <h2 className="text-2xl font-semibold">APP Platform architecture.</h2>
        <p className="max-w-2xl text-gray-300">
          Wellio puts the individual at the center. Trainers, coaches, and
          clinicians connect as optional layers — under strict privacy rules.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr,1.8fr]">
          <div className="space-y-3 text-sm text-gray-200">
            <p>• Individual = primary user of the APP Platform</p>
            <p>• Professionals = optional extensions, invited by the user</p>
            <p>• Raw data = always on device</p>
            <p>• Derived insights = shared only when you choose</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-6 text-sm text-gray-200">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">
              DATA FLOW
            </p>
            <p className="mt-3">
              Individual logs → On-device FWI & trends → Optional derived signal
              sharing → Trainer / Coach / Clinician views.
            </p>
            <p className="mt-3">
              No raw logs, journals, or vault contents ever leave the user's
              device. Communication uses cMixx to eliminate metadata.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="border-b border-white/5 bg-[#020617]">
      <div className="mx-auto max-w-5xl px-6 py-16 space-y-8">
        <h2 className="text-2xl font-semibold">Security as the foundation.</h2>
        <p className="max-w-2xl text-gray-300">
          The APP Platform is built around zero-trust, post-quantum safe
          cryptography, and metadata-proof communication.
        </p>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-200">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <h3 className="text-sm font-semibold">Post-Quantum Encryption</h3>
            <p className="mt-2 text-xs text-gray-300">
              ML-KEM-768 protects long-term confidentiality, even against future
              quantum adversaries.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <h3 className="text-sm font-semibold">Metadata Protection (cMixx)</h3>
            <p className="mt-2 text-xs text-gray-300">
              cMixx hides who talks to whom, and when — preventing pattern
              profiling.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <h3 className="text-sm font-semibold">Zero-Trust Storage</h3>
            <p className="mt-2 text-xs text-gray-300">
              Raw logs, journals, and vault documents remain encrypted on the
              user's device. Servers cannot read them.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfessionalsSection() {
  return (
    <section
      id="professionals"
      className="border-b border-white/5 bg-[#020617]"
    >
      <div className="mx-auto max-w-5xl px-6 py-16 space-y-6">
        <h2 className="text-2xl font-semibold">
          Built for individuals, with optional professional support.
        </h2>
        <p className="max-w-2xl text-gray-300">
          Wellio is not a coaching platform or medical system. It is a Wellness
          APP Platform that lets individuals optionally share derived signals
          with trainers, coaches, and clinicians.
        </p>
        <div className="grid gap-6 md:grid-cols-2 text-sm text-gray-200">
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <h3 className="text-sm font-semibold">For trainers & coaches</h3>
            <ul className="mt-2 space-y-2 text-xs text-gray-300">
              <li>• See FWI and adherence trends</li>
              <li>• Never access raw logs or journals</li>
              <li>• Support clients who already use Wellio</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-white/10 bg-black/40 p-4">
            <h3 className="text-sm font-semibold">For clinicians</h3>
            <ul className="mt-2 space-y-2 text-xs text-gray-300">
              <li>• Observe functional patterns only</li>
              <li>• No PHI, no vault access, no raw entries</li>
              <li>• Reduce risk while still supporting behavior change</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section id="download" className="bg-[#020617]">
      <div className="mx-auto max-w-5xl px-6 py-16 text-center space-y-4">
        <h2 className="text-2xl font-semibold">
          Your health. Your privacy. Your control.
        </h2>
        <p className="mx-auto max-w-xl text-sm text-gray-300">
          Download the Wellio Wellness APP Platform and start tracking your
          wellbeing privately. Invite trainers, coaches, or clinicians when
          you're ready — under your terms.
        </p>
        <div className="mt-4 flex justify-center gap-4">
          <button className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 px-6 py-3 text-sm font-medium text-black shadow-lg shadow-purple-500/30">
            Download on iOS (coming soon)
          </button>
          <button className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white/90">
            Download on Android (coming soon)
          </button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Wellio Wellness APP Platform.</p>
        <div className="flex gap-4">
          <Link href="#privacy">Privacy</Link>
          <Link href="#security">Security</Link>
          <Link href="#professionals">Professionals</Link>
        </div>
      </div>
    </footer>
  );
}
```

---

### Alternative: Separate Component Files

If you prefer separate component files, here's the Hero component:
        
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

---

## 2. Pitch Deck Content (Copy-Paste Ready)

Clean, slide-by-slide content for Google Slides / Keynote:

### Slide 1: Title
**Wellio — The Privacy-First Wellness APP Platform**
- Tagline: AI-powered wellness. Privacy by design.

### Slide 2: Problem
- Wellness apps upload raw logs
- Professionals lack safe visibility
- Clinicians avoid PHI exposure
- Users lose control over their data

### Slide 3: The Shift
- Consumer privacy expectations rising
- AI wellness guidance is mainstream
- Remote coaching/clinical support exploding

### Slide 4: What Wellio Is
A privacy-first Wellness APP Platform for individuals, with optional support from trainers, coaches, and clinicians.

### Slide 5: Individual Experience
- FWI daily score
- Today at a Glance
- Sleep, meals, hydration, movement, mood logs
- Encrypted medical vault
- AI wellness assistant

### Slide 6: FWI (Functional Wellness Index)
- Composite of sleep, food, hydration, movement, mood, recovery
- Computed on-device
- Never sold, never shared by default

### Slide 7: APP Platform Architecture
- Individual at center
- Optional professional extensions
- Raw data on device
- Derived insights only

### Slide 8: Trainers & Coaches Layer
- See FWI, adherence trends, patterns
- Never see raw logs, vault, or journals
- Support clients using Wellio, not replace their tools

### Slide 9: Clinician Layer
- See functional patterns & adherence
- No PHI, no vault, no raw data
- Reduced compliance exposure

### Slide 10: Security Stack
- ML-KEM-768 (post-quantum key encapsulation)
- AES-256-GCM for vault and local storage
- cMixx for metadata elimination
- Zero-trust server architecture

### Slide 11: Differentiation
- Consumer-first (individual, not clinic)
- Multi-role APP Platform
- Post-quantum secure
- Metadata-private

### Slide 12: Market
- $1.8T wellness
- $120B telehealth
- $20B+ coaching & training
- $50B+ privacy & security

### Slide 13: Go-To-Market
- Individuals first (APP users)
- Pros join via client invites
- Clinician advisory + pilots
- Privacy-focused marketing & partnerships

### Slide 14: Traction
- Users
- Professionals
- Active FWI engagement
- Retention

### Slide 15: Business Model
- Free tier
- Wellio+ subscription
- Pro extension plans (trainer / clinician)
- Session / program-based revenue option

### Slide 16: Roadmap
- v1 APP Platform (FWI, logs, vault, messaging)
- Professional insights dashboard
- Wearables integration (Suunto etc.)
- Privacy-preserving analytics & programs

### Slide 17: Technology
- React Native
- Supabase (or chosen backend)
- PQ crypto libs
- xx network cMixx integration

### Slide 18: Team
- Founder Bulldog
- Advisors (clinicians, cryptographers, product)

### Slide 19: Vision
Become the default Wellness APP Platform for people who refuse to trade health for surveillance.

### Slide 20: Ask / Contact
- Funding ask (if using for investors)
- Strategic intros
- QR code / link

---

## 3. Hero Animation Keyframe Cheat Sheet

For animator reference — key moments to hit:

| Keyframe | Time | Description |
|----------|------|-------------|
| KF1 | 0:01 | Logs flying into "cloud" icons |
| KF2 | 0:03 | Hard cut to dark, all logs disappear. Wellio phone appears |
| KF3 | 0:06 | FWI ring draws from 0 → 78 with smooth easing |
| KF4 | 0:09 | Trainer & Clinician icons slide in; lines showing only simple FWI signal graph |
| KF5 | 0:13 | PQ lock closes around the phone |
| KF6 | 0:16 | cMixx nodes swirl around: messaging lines become blurred, then vanish |
| KF7 | 0:20 | Everything fades to Wellio logo + tagline: "Your health. Your privacy. Your control." |

---

## 4. Key App Screens Spec

Must-have screens in the APP Platform:

### Screen 1: Today Screen
- FWI ring (big, prominent)
- 5 mini-cards: Sleep, Meals, Hydration, Movement, Mood
- Short text: "Professionals see trends only, never raw logs."

### Screen 2: Logs Screen
- Tabbed categories (Sleep, Meals, Hydration, Movement, Mood)
- Each entry: time + summary
- FAB button for adding new logs

### Screen 3: Medical Vault
- **Locked state:** Biometric prompt + "AES-256 + ML-KEM-768 protected"
- **Unlocked state:** Document cards, simple view/download UI

### Screen 4: Professional View (Coach/Trainer)
- Client list with FWI + trend arrow
- No log details, no journals, no vault
- Labels explicitly: "Derived signals only"

### Screen 5: Professional View (Clinician)
- Similar to coach but with more emphasis on multi-week trends and patterns
- Banner: "This view contains no PHI or raw data."

### Screen 6: Messaging with cMixx
- E2E message view
- Banner: "Metadata protected via cMixx"
- Optional PQ badge icon

---

## 5. Branding Library — Logo & Badges

### Logo Wordmark (SVG)

```svg
<svg width="260" height="60" viewBox="0 0 260 60" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="wellioGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>
  <rect width="260" height="60" rx="16" fill="#020617"/>
  <text x="24" y="36" font-family="Inter, system-ui" font-size="24" fill="white" font-weight="600">
    WELLIO
  </text>
  <rect x="140" y="18" width="96" height="24" rx="12" fill="url(#wellioGrad)" />
  <text x="150" y="35" font-family="Inter, system-ui" font-size="11" fill="#020617" font-weight="600">
    APP PLATFORM
  </text>
</svg>
```

### Security Badge (PQ + cMixx)

```svg
<svg width="220" height="36" viewBox="0 0 220 36" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="secGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#7C3AED"/>
      <stop offset="100%" stop-color="#22D3EE"/>
    </linearGradient>
  </defs>
  <rect width="220" height="36" rx="18" fill="#020617" stroke="url(#secGrad)" stroke-width="1.2"/>
  <circle cx="20" cy="18" r="6" fill="url(#secGrad)"/>
  <text x="36" y="22" font-family="Inter, system-ui" font-size="11" fill="#E5E7EB">
    PQ Encryption + cMixx Metadata Protection
  </text>
</svg>
```

---

*Last updated: December 2024*
