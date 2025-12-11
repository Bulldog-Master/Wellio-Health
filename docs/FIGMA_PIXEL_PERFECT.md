# Wellio — Figma Design System (Pixel-Perfect Blueprint)

Complete specification for designer handoff.

---

## A. Design Language Rules

### 1. Page Dimensions

| Device | Width | Columns | Gutters | Margins |
|--------|-------|---------|---------|---------|
| Desktop | 1440px | 12 | 24px | 120px |
| Tablet | 768px | 8 | 20px | 40px |
| Mobile | 390px | 4 | 16px | 24px |

### 2. Corner Radii

| Element | Radius |
|---------|--------|
| Buttons | 12px |
| Cards | 16px |
| Vault tiles | 20px |
| Input fields | 8px |
| Badges | 100px (pill) |
| Avatars | 50% (circle) |

### 3. Shadows

```css
/* Shadow 1 - Cards, elevated elements */
box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.20);

/* Shadow 2 - Modals, overlays */
box-shadow: 0px 8px 28px rgba(0, 0, 0, 0.30);

/* Shadow 3 - Glow effect */
box-shadow: 0px 0px 40px rgba(124, 58, 237, 0.25);
```

### 4. Typography Scale

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| H1 | Space Grotesk | 48px | Bold (700) | 56px |
| H2 | Space Grotesk | 36px | Bold (700) | 44px |
| H3 | Space Grotesk | 24px | SemiBold (600) | 32px |
| H4 | Space Grotesk | 20px | SemiBold (600) | 28px |
| Body | Inter | 16px | Regular (400) | 24px |
| Body Small | Inter | 14px | Regular (400) | 20px |
| Caption | Inter | 12px | Medium (500) | 16px |
| Button | Inter | 16px | SemiBold (600) | 24px |

### 5. Color Tokens

```css
/* Primary */
--primary: #7C3AED;
--primary-hover: #6D28D9;
--primary-light: #A78BFA;

/* Accent */
--accent: #22D3EE;
--accent-hover: #06B6D4;

/* Background */
--bg-primary: #0D0F14;
--bg-secondary: #1A1C22;
--bg-tertiary: #20232B;

/* Text */
--text-primary: #FFFFFF;
--text-secondary: #A1A1AA;
--text-muted: #71717A;

/* Status */
--success: #23E08A;
--warning: #FFB84D;
--error: #FF4C61;
```

---

## B. Mobile App Screens (390px width)

### Screen 1 — Onboarding: Welcome

**Layout:**
- Safe area: 47px top, 34px bottom
- Content padding: 24px horizontal

**Elements:**
| Element | Position | Size |
|---------|----------|------|
| Wellio Logo | Center, Y: 120px | 80px × 80px |
| Title H1 | Center, Y: 240px | Full width |
| Subtitle | Center, Y: 320px | Full width |
| Get Started Button | Bottom, 34px margin | Full width, 56px height |
| Security Badges | Bottom footer, 16px margin | 2 badges, 40px height |

**Copy:**
- Title: "A Wellness APP Platform built around privacy."
- Subtitle: "Your wellness. Your data. Your control."
- Button: "Get Started"

---

### Screen 2 — Permissions

**Layout:**
- Header: 64px height
- Content: Card-based list

**Elements:**
| Element | Size | Spacing |
|---------|------|---------|
| Section Card | Full width - 48px | 16px gap |
| Toggle Row | 56px height | 12px padding |
| Icon | 24px × 24px | 16px margin-right |
| Toggle Switch | 52px × 32px | Right aligned |

**Toggles:**
1. Push Notifications — "Get wellness reminders"
2. Biometrics — "Secure your vault with Face ID"
3. Vault Access — "Enable encrypted storage"

---

### Screen 3 — Today at a Glance

**FWI Circle Component:**
| Property | Value |
|----------|-------|
| Outer Diameter | 210px |
| Ring Thickness | 18px |
| Center Number | 48px, Bold |
| Trend Arrow | 16px icon |
| Position | Center, Y: 140px |

**Wellness Cards Grid:**
| Property | Value |
|----------|-------|
| Grid | 2 columns |
| Card Size | 160px × 120px |
| Gap | 16px |
| Position | Below FWI, 24px margin |

**Card Structure:**
```
┌─────────────────────┐
│ 🌙  Sleep           │  <- Icon + Label (top)
│                     │
│      7.5h           │  <- Metric (center, bold)
│   ▲ +0.5h           │  <- Trend (bottom, small)
└─────────────────────┘
```

**Cards:**
1. Sleep — Moon icon, hours
2. Meals — Fork icon, count
3. Hydration — Droplet icon, glasses
4. Movement — Flame icon, minutes
5. Mood — Heart icon, score

---

### Screen 4 — Logs (Meals)

**Header:**
- Height: 56px
- Back arrow: 24px
- Title: "Meal Log" (H3, center)

**Tab Bar:**
- Height: 48px
- Tabs: Sleep | Meals | Hydration | Activity | Mood
- Active indicator: 2px underline, primary color

**List Cell:**
| Property | Value |
|----------|-------|
| Height | 72px |
| Image Circle | 48px diameter |
| Title | 16px, SemiBold |
| Subtitle | 14px, Secondary |
| Timestamp | 12px, Muted, right |

**FAB:**
| Property | Value |
|----------|-------|
| Size | 64px × 64px |
| Position | Bottom-right, 24px margin |
| Icon | Plus, 24px |
| Background | Primary gradient |
| Shadow | Shadow 2 |

---

### Screen 5 — Medical Vault

**Locked State:**
| Element | Size/Position |
|---------|---------------|
| Lock Icon | 80px, center |
| Title | "Vault Locked" (H2) |
| Subtitle | Security explanation |
| Unlock Button | Full width, 56px |
| Security Badge | "AES-256 + ML-KEM-768" |

**Unlocked State:**
| Property | Value |
|----------|-------|
| Grid | 3 columns |
| Card Size | 110px × 140px |
| Gap | 12px |
| Padding | 16px |

**Document Card:**
```
┌───────────┐
│           │
│   📄      │  <- File type icon
│           │
├───────────┤
│ Lab Result│  <- Name (truncate)
│ PDF • 2MB │  <- Type + size
└───────────┘
```

---

### Screen 6 — Professionals

**Tab Bar:**
- Tabs: Trainers/Coaches | Clinicians

**Professional Card:**
| Property | Value |
|----------|-------|
| Height | 120px |
| Avatar | 56px circle |
| Role Badge | Pill, 24px height |
| Button | "View Signals", secondary |

**Card Layout:**
```
┌─────────────────────────────────────┐
│  👤  Dr. Sarah Chen                 │
│      Clinician                      │
│      ━━━━━━━━━━ 78 ▲               │  <- Mini FWI
│  [ View Signals ]                   │
└─────────────────────────────────────┘
```

---

### Screen 7 — Messaging

**Header:**
| Element | Value |
|---------|-------|
| Height | 64px |
| Avatar | 40px |
| Name | H4 |
| Badge | "cMixx Protected" pill |

**Chat Bubbles:**
| Property | Sent | Received |
|----------|------|----------|
| Max Width | 80% | 80% |
| Padding | 12px 16px | 12px 16px |
| Border Radius | 12px | 12px |
| Background | Primary | bg-secondary |
| Alignment | Right | Left |

**Input Bar:**
| Property | Value |
|----------|-------|
| Height | 56px |
| Input | Full width - 64px |
| Send Button | 48px circle |

**Security Indicator:**
- Position: Below header
- Badge: "🔒 PQ Encrypted • Metadata Protected"

---

## C. Desktop Screens (1440px width)

### Dashboard Layout

**Sidebar:**
| Property | Value |
|----------|-------|
| Width | 280px |
| Background | bg-secondary |
| Logo | 40px, top |
| Nav Items | 48px height each |

**Main Content:**
| Property | Value |
|----------|-------|
| Width | 1160px |
| Padding | 48px |
| Max content width | 1000px |

---

## D. Component Library

### Buttons

**Primary:**
```css
background: linear-gradient(135deg, #7C3AED, #22D3EE);
color: white;
padding: 16px 32px;
border-radius: 12px;
font-weight: 600;
```

**Secondary:**
```css
background: transparent;
border: 1px solid rgba(255,255,255,0.2);
color: white;
padding: 16px 32px;
border-radius: 12px;
```

**Ghost:**
```css
background: transparent;
color: white;
padding: 16px 32px;
```

### Badges

**Security Badge:**
```css
background: rgba(124, 58, 237, 0.2);
border: 1px solid rgba(124, 58, 237, 0.4);
color: #A78BFA;
padding: 6px 12px;
border-radius: 100px;
font-size: 12px;
```

### FWI Score Ring

**SVG Structure:**
- Outer circle: stroke-width 18px, stroke #20232B
- Progress arc: stroke-width 18px, gradient stroke
- Center text: 48px bold
- Trend arrow: 16px icon

---

## E. Export Specifications

### Icons
- Format: SVG
- Size: 24px base
- Stroke: 2px
- Color: currentColor

### Images
- Format: WebP (PNG fallback)
- @1x, @2x, @3x for mobile
- @1x, @2x for desktop

### Fonts
- Space Grotesk: Google Fonts
- Inter: Google Fonts

---

*Last updated: December 2024*
