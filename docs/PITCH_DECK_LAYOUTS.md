# Wellio — Pitch Deck Visual Layouts

Designer-ready slide specifications for presentation assembly.

---

## Global Design Specs

### Slide Dimensions
- **Size:** 1920 × 1080 px (16:9)
- **Safe Zone:** 80px margins all sides
- **Grid:** 12-column, 60px gutters

### Typography
- **Titles:** Space Grotesk Bold, 72px
- **Subtitles:** Inter Medium, 32px
- **Body:** Inter Regular, 24px
- **Labels:** Inter Medium, 18px

### Colors
- **Background:** #0D0F14 (all slides)
- **Primary:** #7C3AED
- **Accent:** #22D3EE
- **Text:** #FFFFFF
- **Muted:** #A1A1AA

---

## Slide 1 — Title

**Background:**
- Midnight gradient with purple-cyan radial burst
- Subtle noise texture overlay (5% opacity)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        WELLIO                               │  <- Logo, 120px
│                                                             │
│     The Privacy-First Wellness APP Platform                 │  <- H1, center
│                                                             │
│                    [Phone Mockup]                           │  <- Today screen
│                                                             │
│  Wellness APP Platform  •  Privacy-First  •  PQ Secure      │  <- Footer badges
└─────────────────────────────────────────────────────────────┘
```

---

## Slide 2 — Problem

**Layout: Two-column**

**Left Column (50%):**
- Title: "Wellness Apps Are Broken"
- Bullets (24px, 40px spacing):
  - They collect your data
  - They track your patterns
  - They expose you to breaches
  - They sell your behavior

**Right Column (50%):**
- Illustration: Generic app icons with data streams flowing to cloud
- Red warning indicators
- Caption: "Your data. Their profit."

---

## Slide 3 — The Global Shift

**Layout: Three cards horizontally**

```
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│      🔐         │  │      🤖         │  │      👥         │
│                 │  │                 │  │                 │
│    Privacy      │  │       AI        │  │     Remote      │
│  = New Premium  │  │   = New Guide   │  │    = New Need   │
│                 │  │                 │  │                 │
│  Users demand   │  │  Intelligent,   │  │  Clinicians     │
│  data control   │  │  not invasive   │  │  need non-PHI   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

**Card Specs:**
- Width: 400px
- Height: 320px
- Border radius: 24px
- Background: bg-secondary
- Icon: 64px, gradient colored

---

## Slide 4 — What is Wellio?

**Layout: Centered statement**

**Center:**
- Title: "A Wellness APP Platform for individuals."
- Subtitle: "Professionals join only when invited."

**Bottom:**
- Three small icons: Individual → Platform → Optional Pro
- Connecting lines with arrows

---

## Slide 5 — Individual Experience

**Layout: 2×3 grid of screenshots**

```
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Today   │  │   FWI    │  │   Logs   │
│  Screen  │  │  Detail  │  │  Screen  │
└──────────┘  └──────────┘  └──────────┘
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Vault   │  │    AI    │  │ Messaging│
│  Screen  │  │ Insights │  │  Screen  │
└──────────┘  └──────────┘  └──────────┘
```

**Screenshot Specs:**
- Size: 280px × 560px (phone frame)
- Shadow: Shadow 2
- Border: 1px rgba(255,255,255,0.1)

---

## Slide 6 — FWI

**Layout: Center graphic + legend**

**Center:**
- Large FWI circle animation (400px diameter)
- Score: 82 (animated count-up)
- Trend arrow: ▲

**Bottom:**
- Legend: 5 colored dots with labels
- Sleep | Meals | Hydration | Activity | Mood

---

## Slide 7 — Architecture

**Layout: Layered diagram**

```
                    ┌─────────────────┐
                    │   INDIVIDUAL    │
                    │    (Center)     │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │     APP PLATFORM LAYER      │
              └──────────────┬──────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────┴────┐        ┌────┴────┐        ┌────┴────┐
    │ Trainer │        │  Coach  │        │Clinician│
    └─────────┘        └─────────┘        └─────────┘
                             │
              ┌──────────────┴──────────────┐
              │    PQ + cMixx SECURITY      │
              └─────────────────────────────┘
```

**Styling:**
- Boxes: Gradient borders
- Lines: Dashed, animated
- Background: Subtle grid pattern

---

## Slide 8 — Trainers & Coaches

**Layout: Two-column**

**Left Column:**
- Title: "Trainers & Coaches"
- Subtitle: "See trends, not logs"
- Bullets:
  - ✅ FWI scores
  - ✅ Adherence patterns
  - ❌ Raw log entries
  - ❌ Personal journals
  - ❌ Communication metadata

**Right Column:**
- Coach dashboard screenshot
- FWI trend chart visible
- "No raw data" overlay badge

---

## Slide 9 — Clinicians

**Layout: Two-column (mirror of Slide 8)**

**Left Column:**
- Title: "Clinicians"
- Subtitle: "Derived signals, no PHI"
- Bullets:
  - ✅ Functional patterns
  - ✅ 30-day trends
  - ❌ Medical vault
  - ❌ PHI exposure
  - ❌ Compliance burden

**Right Column:**
- Clinician dashboard screenshot
- Trend visualization
- "Zero PHI" badge

---

## Slide 10 — Security Infrastructure

**Layout: Four-quadrant diagram**

```
┌─────────────────────┬─────────────────────┐
│                     │                     │
│    ML-KEM-768       │    AES-256-GCM      │
│  Post-Quantum Key   │  Symmetric Encrypt  │
│    Encapsulation    │    Local Vault      │
│                     │                     │
├─────────────────────┼─────────────────────┤
│                     │                     │
│      cMixx          │    Zero-Trust       │
│  Metadata Network   │    Architecture     │
│    Elimination      │  Server Can't Read  │
│                     │                     │
└─────────────────────┴─────────────────────┘
```

**Styling:**
- Each quadrant: Different gradient tint
- Icons: 48px, white
- Connecting lines: Dashed

---

## Slide 11 — Competitive Matrix

**Layout: Comparison table**

| Feature | MyFitnessPal | WHOOP | BetterHelp | Wellio |
|---------|:------------:|:-----:|:----------:|:------:|
| On-device storage | ❌ | ❌ | ❌ | ✅ |
| PQ Encryption | ❌ | ❌ | ❌ | ✅ |
| Metadata elimination | ❌ | ❌ | ❌ | ✅ |
| Multi-role support | ❌ | ❌ | ❌ | ✅ |
| Professional extensions | ❌ | ❌ | ✅ | ✅ |
| AI insights | ✅ | ✅ | ✅ | ✅ |

**Styling:**
- Header row: bg-secondary
- Wellio column: Primary gradient highlight
- Checkmarks: Green (#23E08A)
- X marks: Red (#FF4C61)

---

## Slide 12 — Market Opportunity

**Layout: Venn diagram**

**Three overlapping circles:**
- Wellness: $1.8T (largest)
- Telehealth: $120B
- Privacy: $50B

**Intersection highlight:**
- "Wellio's Opportunity"
- $5B+ addressable

---

## Slide 13 — Go-To-Market

**Layout: Funnel flow**

```
        ┌─────────────────────────┐
        │      Individuals        │  <- Acquisition
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │   Professional Invites   │  <- Viral loop
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │     Clinic Adoption      │  <- B2B
        └───────────┬─────────────┘
                    │
        ┌───────────▼─────────────┐
        │    Community Growth      │  <- Retention
        └─────────────────────────┘
```

---

## Slide 14 — Traction

**Layout: Metrics dashboard**

**Three large numbers:**
- 10K — Early Users (projected)
- 500 — Professionals Invited
- 50 — Clinician Relationships

**Graph:**
- Growth curve projection
- MoM growth %

---

## Slide 15 — Revenue Model

**Layout: Pricing tiers**

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│     Free     │  │     Plus     │  │     Pro      │
│              │  │              │  │              │
│   Basic FWI  │  │   Full FWI   │  │  Extensions  │
│   Logging    │  │   Vault      │  │  Video       │
│              │  │   AI         │  │  Team        │
│              │  │              │  │              │
│    $0/mo     │  │   $9.99/mo   │  │  $29.99/mo   │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## Slide 16 — Product Roadmap

**Layout: Timeline**

| Q1 2025 | Q2 2025 | Q3 2025 | Q4 2025 |
|---------|---------|---------|---------|
| FWI + Vault | Pro Extensions | Wearables | Marketplace |
| Basic AI | Video Sessions | Advanced AI | Community |
| iOS Launch | Android Launch | API Partners | Enterprise |

---

## Slide 17 — Tech Stack

**Layout: Logo grid**

```
┌─────────┬─────────┬─────────┐
│  React  │Supabase │   PQ    │
│         │         │  Crypto │
├─────────┼─────────┼─────────┤
│  cMixx  │ On-Dev  │  E2E    │
│         │ Compute │ Encrypt │
└─────────┴─────────┴─────────┘
```

---

## Slide 18 — Team

**Layout: Grid of headshots**

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│  [IMG]  │  │  [IMG]  │  │  [IMG]  │
│ Founder │  │   CTO   │  │  CMO    │
│ Bulldog │  │  [Name] │  │  [Name] │
└─────────┘  └─────────┘  └─────────┘
```

**Advisor row below**

---

## Slide 19 — Vision

**Layout: Full-bleed image**

**Background:** Gradient with subtle grid pattern

**Center text:**
- "Private wellness for the next decade."
- "The future of health is individual-first."

---

## Slide 20 — Contact

**Layout: Centered CTA**

**Center:**
- Large QR code (300px)
- Website URL
- Email contact

**Bottom:**
- Social icons
- "Let's talk: [email]"

---

*Last updated: December 2024*
