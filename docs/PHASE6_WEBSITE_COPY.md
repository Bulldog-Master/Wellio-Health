# Wellio Website Copy & Animation Instructions

## Final Website Content

---

## HERO SECTION

### Headline
> **A Privacy-First Wellness APP Platform**

### Subheadline
> Track your wellbeing privately. Invite professionals only if you choose. Post-quantum secure.

### CTA Buttons
- **Primary:** "Get Started Free"
- **Secondary:** "Watch Demo"

### Animation
- Phone mockup floats up from bottom (0.5s ease-out)
- Background gradient pulses subtly (3s loop)
- Security badges fade in sequentially (0.3s delay each)

---

## SECTION 2 — FEATURES

### Section Title
> **Everything You Need. Nothing You Don't.**

### Feature Cards (3-column)

**Card 1 — FWI**
- Icon: Circle/meter
- Title: "Functional Wellness Index"
- Text: "One score that captures your sleep, nutrition, movement, and mood."

**Card 2 — Logs**
- Icon: List
- Title: "Private Wellness Logs"
- Text: "Track your daily habits. All data stays on your device."

**Card 3 — Vault**
- Icon: Lock
- Title: "Encrypted Medical Vault"
- Text: "Store sensitive documents with AES-256 + post-quantum encryption."

### Animation
- Cards scale up from 0.9 to 1.0 on scroll-into-view
- Icons have subtle bounce on hover

---

## SECTION 3 — ARCHITECTURE

### Section Title
> **Built for Privacy from Day One**

### Diagram Description
```
Individual (center)
    ↓
Derived Signals (FWI, trends)
    ↓
Optional Professional Extensions
    ↓
Zero-Trust Infrastructure
```

### Text Block
> "Your raw logs never leave your device. Professionals see only derived wellness signals — never your meals, notes, or metadata."

### Animation
- Diagram builds layer-by-layer on scroll
- Each layer highlights briefly (0.5s)

---

## SECTION 4 — SECURITY

### Section Title
> **Security That Survives the Future**

### Security Cards (3-column)

**Card 1 — Post-Quantum**
- Badge: "ML-KEM-768"
- Text: "Future-proof encryption that resists quantum computer attacks."

**Card 2 — cMixx**
- Badge: "Metadata Protection"
- Text: "Your communication patterns are invisible — even to us."

**Card 3 — Zero-Trust**
- Badge: "On-Device"
- Text: "We can't access what we don't have."

### Animation
- Shield icons pulse on hover
- Badges glow with subtle violet tint

---

## SECTION 5 — FOR PROFESSIONALS

### Section Title
> **For Coaches & Clinicians**

### Two-Column Layout

**Left Column — Coaches**
- Title: "Train with Insight, Not Invasion"
- Bullets:
  - See FWI trends and adherence
  - No access to raw logs or meals
  - Secure video sessions
  - Invite clients with a code

**Right Column — Clinicians**
- Title: "Support Without PHI Risk"
- Bullets:
  - Functional signals only
  - No identifiable health records
  - Lower liability exposure
  - Between-visit monitoring

### CTA
> "Join the Professional Program"

### Animation
- Columns slide in from opposite sides
- Professional badges float up

---

## SECTION 6 — PRICING

### Section Title
> **Choose Your Plan**

### Pricing Cards

**Free**
- Price: $0/month
- Features: FWI, basic logs, vault (limited)

**Plus**
- Price: $9.99/month
- Features: Full FWI, unlimited logs, full vault, AI insights

**Professional**
- Price: $29-99/month
- Features: Client management, video sessions, advanced analytics

### Animation
- Cards lift on hover (subtle shadow increase)
- "Popular" badge bounces on Plus card

---

## SECTION 7 — TRUST SIGNALS

### Section Title
> **Why Users Trust Wellio**

### Badges (horizontal row)
- CodeQL Security Scanned
- Snyk Vulnerability Checked
- Zero-Trust Architecture
- No Tracking, Ever

### Testimonial Placeholder
> "Finally, a wellness app that doesn't make me the product."

### Animation
- Badges fade in left-to-right
- Testimonial card slides up

---

## FOOTER

### Columns

**Product**
- Features
- Pricing
- Security
- For Professionals

**Company**
- About
- Blog
- Careers
- Press Kit

**Legal**
- Privacy Policy
- Terms of Service
- Cookie Policy
- GDPR

**Connect**
- Twitter/X
- Instagram
- LinkedIn
- Discord

### Bottom Bar
- © 2024 Wellio. All rights reserved.
- "Wellness without surveillance."

---

## Animation Guidelines

### Timing
- Entrance animations: 0.3-0.5s
- Hover transitions: 0.2s
- Scroll-triggered: 0.5s delay between elements

### Easing
- Default: `ease-out`
- Bouncy: `cubic-bezier(0.68, -0.55, 0.265, 1.55)`

### Performance
- Use CSS transforms only (no layout shifts)
- Reduce motion for `prefers-reduced-motion`

---

*Last updated: December 2024*
