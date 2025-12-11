# Wellio Figma-Quality Screen Renders

## Pixel-Perfect Static Design Specifications

---

## A. HOME / TODAY SCREEN

### Layout
- FWI circle (big, center top) — 210px diameter
- 5 metric cards in a 2×3 layout
- "Today Insights" carousel at bottom

### Colors
- Background: #0D0F14 (Black)
- Accents: #7C3AED (Violet), #22D3EE (Cyan)

### FWI Circle Component
- Ring Thickness: 18px
- Center Number: H1 (Bold, 48px)
- Trend Arrow: 16px icon

### Metric Cards (Each 160px height)
1. **Sleep** — Moon icon, hours logged
2. **Meals** — Utensils icon, meals count
3. **Hydration** — Droplet icon, oz/ml
4. **Movement** — Activity icon, minutes
5. **Mood** — Smile icon, rating

---

## B. LOGS SCREEN

### Tabs
- Meals
- Hydration
- Sleep
- Movement
- Mood

### Entry Cards
- Rounded 16px corners
- Icon (left) + Label + Timestamp
- Indicator bar (progress)

### FAB (Floating Action Button)
- Position: Bottom-right
- Size: 64px
- Style: Gradient (violet → cyan)

---

## C. MEDICAL VAULT

### Locked State
- Large lock icon (centered, 120px)
- Biometric prompt text
- Badge: "Encrypted with AES-256 + PQ keys"

### Unlocked State
- 3-column grid of document cards
- Card size: 110×140px
- Shows: File icon, name, type, date

---

## D. PROFESSIONAL DASHBOARD

### Shows (for coaches/clinicians)
- FWI trend line (14-day)
- Adherence rings (workout, nutrition, sleep)
- No raw logs visible

### Client List
- Avatar + Name + FWI score
- Trend indicator (up/down/stable)
- Last active timestamp

---

## E. MESSAGING (cMixx)

### Header
- "Metadata Protected by cMixx" badge
- PQ Encrypted indicator

### Chat Interface
- Bubble max-width: 80%
- Border-radius: 12px
- Sent: Right-aligned, violet tint
- Received: Left-aligned, surface gray

### Status Indicators
- Lock icon: E2E encrypted
- Shield icon: cMixx routed

---

## F. ONBOARDING SCREENS

### Screen 1 — Welcome
- Wellio logo (centered)
- Title: "A Wellness APP Platform built around privacy."
- Subtitle: "Your wellness. Your data. Your control."
- Button: "Get Started" (full-width, gradient)
- Footer: PQ + cMixx badges

### Screen 2 — Permissions
- 3-item card list with toggles:
  - Notifications
  - Biometrics
  - Vault Access

### Screen 3 — Goals
- Multi-select grid:
  - Better Sleep
  - Nutrition
  - Fitness
  - Mental Wellness
  - Medical Tracking

### Screen 4 — Security Setup
- PIN/Biometric setup
- Explanation of encryption

### Screen 5 — Complete
- Checkmark animation
- "You're all set!" message
- "Go to Today" button

---

## G. SETTINGS SCREEN

### Sections
1. **Profile** — Avatar, name, email
2. **Privacy** — Data retention, consent toggles
3. **Security** — 2FA, backup codes, session management
4. **Professionals** — Manage connections
5. **About** — Version, legal links

---

## Design Tokens Reference

### Colors
```
--primary-black: #0D0F14
--surface-gray: #1A1C22
--light-surface: #20232B
--wellness-violet: #7C3AED
--wellness-cyan: #22D3EE
--success: #23E08A
--warning: #FFB84D
--alert: #FF4C61
```

### Typography Scale
```
H1: 48px / Bold
H2: 36px / Bold
H3: 24px / SemiBold
H4: 20px / SemiBold
Body: 16px / Regular
Caption: 14px / Regular
Small: 12px / Regular
```

### Spacing
```
4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 56 / 72 px
```

### Border Radius
```
Buttons: 12px
Cards: 16px
Vault tiles: 20px
Circles: 9999px
```

---

*Last updated: December 2024*
