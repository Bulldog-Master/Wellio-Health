# Wellio Visual System Recommendations

Design guidelines for consistent APP Platform branding.

---

## 🎨 Color Palette

### Primary Colors

| Name | HSL | Hex | Usage |
|------|-----|-----|-------|
| Primary | hsl(217, 91%, 60%) | #3B82F6 | CTAs, highlights, interactive elements |
| Primary Glow | hsl(217, 91%, 70%) | #60A5FA | Hover states, gradients |
| Primary Dark | hsl(217, 91%, 50%) | #2563EB | Active states, emphasis |

### Background & Surface

| Name | HSL | Usage |
|------|-----|-------|
| Background | hsl(222, 84%, 5%) | Main background (dark mode) |
| Surface | hsl(222, 84%, 8%) | Cards, elevated surfaces |
| Muted | hsl(222, 84%, 15%) | Secondary backgrounds |

### Text

| Name | HSL | Usage |
|------|-----|-------|
| Foreground | hsl(0, 0%, 98%) | Primary text |
| Muted Foreground | hsl(215, 20%, 65%) | Secondary text |
| Accent Foreground | hsl(0, 0%, 98%) | Text on accent backgrounds |

### Semantic Colors

| Name | HSL | Usage |
|------|-----|-------|
| Success | hsl(142, 71%, 45%) | Positive actions, confirmations |
| Warning | hsl(38, 92%, 50%) | Cautions, attention |
| Destructive | hsl(0, 84%, 60%) | Errors, dangerous actions |
| Privacy | hsl(265, 89%, 78%) | Security badges, encryption indicators |

---

## 📝 Typography

### Font Family
**Inter** — Clean, modern, highly readable

### Font Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Display | 72px | Bold (700) | 1.1 |
| H1 | 48px | Bold (700) | 1.2 |
| H2 | 36px | Semi-Bold (600) | 1.25 |
| H3 | 24px | Semi-Bold (600) | 1.3 |
| H4 | 20px | Medium (500) | 1.4 |
| Body | 16px | Regular (400) | 1.5 |
| Small | 14px | Regular (400) | 1.5 |
| Caption | 12px | Regular (400) | 1.4 |

### Font Usage

- **Headlines:** Bold, impactful, privacy-focused messaging
- **Body:** Clean, readable, informative
- **UI Text:** Medium weight, clear hierarchy

---

## 🎭 Iconography

### Style
- **Lucide React** icons (consistent with codebase)
- Stroke width: 1.5-2px
- Rounded corners
- Minimal detail

### Key Icons

| Icon | Usage |
|------|-------|
| Shield | Security, encryption |
| Lock | Privacy, protected data |
| Eye / EyeOff | Visible vs hidden data |
| User | Individual users |
| Dumbbell | Trainers, coaches |
| Stethoscope | Clinicians |
| Activity | FWI, wellness tracking |
| CheckCircle | Confirmations, features |
| Zap | Performance, speed |

---

## 🖼️ Imagery

### Photo Style
- **Real people** in wellness contexts
- **Natural lighting**, not overly processed
- **Diverse representation**
- **Clean backgrounds**, minimal distraction

### Avoid
- Stock photo clichés
- Overly posed fitness shots
- Cluttered compositions
- Dated visual styles

### Illustrations
- Minimal, geometric
- Use brand colors
- Convey concepts clearly
- Support, don't replace, messaging

---

## 📐 Layout Principles

### Spacing Scale

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Icon padding |
| md | 16px | Component padding |
| lg | 24px | Section spacing |
| xl | 32px | Large gaps |
| 2xl | 48px | Section margins |
| 3xl | 64px | Major sections |

### Grid
- 12-column grid
- Max width: 1200px (content)
- Max width: 1400px (full-bleed)
- Gutter: 24px (desktop), 16px (mobile)

### Responsive Breakpoints

| Name | Width | Usage |
|------|-------|-------|
| sm | 640px | Mobile landscape |
| md | 768px | Tablet |
| lg | 1024px | Desktop |
| xl | 1280px | Large desktop |
| 2xl | 1536px | Extra large |

---

## 🏷️ Badge Design

### Trust Badges
```
[Shield Icon] Post-Quantum Encryption (ML-KEM-768)
[Lock Icon] Metadata Protection (cMixx)
[Zap Icon] Zero-Trust Architecture
```

- Border: 1px solid border/20
- Background: transparent
- Padding: 12px 16px
- Border radius: 9999px (pill)
- Font: 12px, medium weight

### Feature Badges
- Background: primary/10
- Icon + text
- Consistent sizing

---

## 🎬 Motion Guidelines

### Principles
- **Purposeful:** Animation supports understanding
- **Subtle:** Never distracting
- **Fast:** 200-300ms duration
- **Eased:** Natural acceleration/deceleration

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro-interactions | 150-200ms | ease-out |
| Transitions | 200-300ms | ease-in-out |
| Page transitions | 300-400ms | ease-in-out |
| Loading states | 400-600ms | ease-in-out |

### Common Animations
- **Fade in:** opacity 0 → 1
- **Scale up:** scale 0.95 → 1
- **Slide up:** translateY 10px → 0
- **Pulse:** For loading, attention

---

## 🔒 Security Visual Language

### Encryption Indicators
- Lock icons for encrypted content
- Shield icons for protected features
- Privacy badge on sensitive areas

### Data Visibility
- Eye icon: Visible to professionals
- Eye-off icon: Hidden from professionals
- Green checkmark: User has control

### Trust Hierarchy
1. Zero-trust architecture (foundation)
2. Post-quantum encryption (protection)
3. Metadata elimination (anonymity)

---

## ✅ Do's and Don'ts

### Do
- Use consistent spacing
- Maintain color contrast (WCAG AA)
- Lead with privacy messaging
- Show data control clearly
- Use semantic colors appropriately

### Don't
- Mix icon styles
- Use colors outside the palette
- Overcrowd interfaces
- Hide privacy features
- Use fear-based visuals

---

## 📱 Platform-Specific

### iOS
- SF Pro as system font fallback
- Respect safe areas
- Native feel with custom branding

### Android
- Roboto as system font fallback
- Material Design cues where appropriate
- Consistent with web experience

### Web
- Inter as primary font
- Full design system implementation
- Progressive enhancement

---

*Last Updated: December 2024*
