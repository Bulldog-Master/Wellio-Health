# Wellio Website Build Instructions

## Development Guide for Next.js / React / Webflow

---

## TECH STACK RECOMMENDATIONS

### If Coding (Recommended)
- **Framework:** Next.js 14+ (App Router)
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Components:** shadcn/ui
- **SEO:** Next.js Metadata API
- **Deployment:** Vercel

### If No-Code
- **Platform:** Webflow + Lottie animations
- **Global gradients:** CSS custom properties
- **CMS:** Webflow CMS for blog/updates

---

## PAGE STRUCTURE

```
/                → Home (hero + features + pricing)
/security        → Security model deep dive
/professionals   → Trainer/Clinician overview
/privacy         → Privacy policy
/support         → Help center
/download        → App store links
```

---

## ROUTE DETAILS

| Route | Purpose |
|-------|---------|
| `/` | Homepage with hero, features, pricing |
| `/security` | Deep dive into ML-KEM, AES-256, cMixx |
| `/professionals` | Trainer/Clinician program overview |
| `/privacy` | Privacy policy page |
| `/support` | Help center / FAQ |
| `/download` | App store links + QR codes |

---

## HOMEPAGE SECTIONS

### Section 1: Hero
```jsx
<Hero>
  <HeroContent>
    <h1>A Privacy-First Wellness APP Platform</h1>
    <p>Track your wellbeing privately. Invite professionals only if you choose.</p>
    <ButtonGroup>
      <Button variant="primary">Get Started Free</Button>
      <Button variant="secondary">Watch Demo</Button>
    </ButtonGroup>
  </HeroContent>
  <PhoneMockup>
    <TodayScreenImage />
  </PhoneMockup>
</Hero>
```

**Animations:**
- Phone: `translateY(100px → 0)`, `opacity(0 → 1)`, `duration: 0.8s`
- Text: `translateY(20px → 0)`, `opacity(0 → 1)`, `duration: 0.5s`, `delay: 0.2s`
- Buttons: `translateY(20px → 0)`, `opacity(0 → 1)`, `duration: 0.5s`, `delay: 0.4s`

### Section 2: Features
```jsx
<Features>
  <SectionTitle>Everything You Need. Nothing You Don't.</SectionTitle>
  <FeatureGrid>
    <FeatureCard icon={<FWIIcon />} title="FWI" description="..." />
    <FeatureCard icon={<LogsIcon />} title="Private Logs" description="..." />
    <FeatureCard icon={<VaultIcon />} title="Encrypted Vault" description="..." />
  </FeatureGrid>
</Features>
```

**Animations:**
- Cards: `scale(0.9 → 1)`, `opacity(0 → 1)`, staggered `delay: 0.1s`
- Icons: `bounce` on hover

### Section 3: Architecture
```jsx
<Architecture>
  <SectionTitle>Built for Privacy from Day One</SectionTitle>
  <ArchitectureDiagram />
  <Description>Your raw logs never leave your device...</Description>
</Architecture>
```

**Animations:**
- Diagram: Build layer-by-layer on scroll
- Each layer highlights with `scale(1.02)`, `duration: 0.5s`

### Section 4: Security
```jsx
<Security>
  <SectionTitle>Security That Survives the Future</SectionTitle>
  <SecurityGrid>
    <SecurityCard badge="ML-KEM-768" title="Post-Quantum" />
    <SecurityCard badge="cMixx" title="Metadata Protection" />
    <SecurityCard badge="On-Device" title="Zero-Trust" />
  </SecurityGrid>
</Security>
```

**Animations:**
- Cards: Fade in on scroll
- Badges: Glow pulse on hover

### Section 5: Professionals
```jsx
<Professionals>
  <SectionTitle>For Coaches & Clinicians</SectionTitle>
  <TwoColumn>
    <CoachColumn />
    <ClinicianColumn />
  </TwoColumn>
  <CTAButton>Join the Professional Program</CTAButton>
</Professionals>
```

**Animations:**
- Columns: Slide in from opposite sides
- CTA: Pulse on visibility

### Section 6: Pricing
```jsx
<Pricing>
  <SectionTitle>Choose Your Plan</SectionTitle>
  <PricingGrid>
    <PricingCard tier="Free" price="$0" features={[...]} />
    <PricingCard tier="Plus" price="$9.99" features={[...]} popular />
    <PricingCard tier="Professional" price="$29+" features={[...]} />
  </PricingGrid>
</Pricing>
```

**Animations:**
- Cards: Lift on hover (`translateY(-8px)`, `shadow` increase)
- Popular badge: Bounce animation

### Section 7: Trust
```jsx
<Trust>
  <SectionTitle>Why Users Trust Wellio</SectionTitle>
  <BadgeRow>
    <SecurityBadge>CodeQL Scanned</SecurityBadge>
    <SecurityBadge>Snyk Verified</SecurityBadge>
    <SecurityBadge>Zero-Trust</SecurityBadge>
  </BadgeRow>
  <Testimonial />
</Trust>
```

**Animations:**
- Badges: Fade in left-to-right, `delay: 0.2s` each
- Testimonial: Slide up

### Section 8: Footer
```jsx
<Footer>
  <FooterGrid>
    <ProductLinks />
    <CompanyLinks />
    <LegalLinks />
    <SocialLinks />
  </FooterGrid>
  <Copyright>© 2024 Wellio. All rights reserved.</Copyright>
  <Tagline>Wellness without surveillance.</Tagline>
</Footer>
```

---

## TAILWIND CONFIGURATION

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'wellio-black': '#0D0F14',
        'wellio-surface': '#1A1C22',
        'wellio-light': '#20232B',
        'wellio-violet': '#7C3AED',
        'wellio-cyan': '#22D3EE',
        'wellio-success': '#23E08A',
        'wellio-warning': '#FFB84D',
        'wellio-alert': '#FF4C61',
      },
      fontFamily: {
        'heading': ['Space Grotesk', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
    },
  },
}
```

---

## FRAMER MOTION PRESETS

```js
// lib/animations.js
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3 }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const slideInLeft = {
  initial: { opacity: 0, x: -50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 }
}

export const slideInRight = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.5 }
}
```

---

## SEO REQUIREMENTS

### Meta Tags
```jsx
<Head>
  <title>Wellio - Privacy-First Wellness APP Platform</title>
  <meta name="description" content="Track your wellbeing privately..." />
  <meta property="og:title" content="Wellio" />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
</Head>
```

### Structured Data
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Wellio",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "iOS, Android, Web"
}
```

---

## PERFORMANCE TARGETS

| Metric | Target |
|--------|--------|
| LCP | < 2.5s |
| FID | < 100ms |
| CLS | < 0.1 |
| Performance Score | > 90 |

---

## DEPLOYMENT CHECKLIST

- [ ] Environment variables configured
- [ ] Analytics integrated
- [ ] Error tracking setup
- [ ] SSL certificate active
- [ ] Redirects configured
- [ ] Sitemap generated
- [ ] robots.txt configured
- [ ] Performance optimized
- [ ] Accessibility tested

---

*Last updated: December 2024*
