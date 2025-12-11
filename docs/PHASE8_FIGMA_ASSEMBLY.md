# Wellio — Phase 8: Figma Assembly (Download-Ready Frame Definitions)

## 100% Complete Designer-Usable Blueprint

---

## A. Figma Artboards

### Mobile (Primary)
- **Size:** 390 × 844
- **Pixel density:** @2x export
- **Frame name prefix:** `M/`

### Desktop (Website)
- **Size:** 1440 × 1024
- **Pixel density:** @2x export
- **Frame name prefix:** `D/`

---

## B. Figma Page Structure

```
📁 Wellio — Wellness APP Platform

   📁 1. Foundations
       - Colors
       - Typography
       - Grid Systems
       - Elevation (Shadows)
       - Iconography Set

   📁 2. Components
       - Buttons
       - Cards
       - Inputs
       - Navigation Bars
       - FWI Ring Component
       - Trend Graphs
       - Vault File Cards
       - Messaging Bubbles

   📁 3. Individual User Screens
       - M/Welcome
       - M/Permissions
       - M/Today
       - M/Logs (Meals, Sleep, Hydration, Movement, Mood)
       - M/Medical Vault (Locked & Unlocked)
       - M/AI Assistant
       - M/Settings

   📁 4. Professional Screens
       - M/Enter Invite Code
       - M/Care Team Hub
       - M/Coach Dashboard
       - M/Clinician Dashboard
       - M/Session View
       - M/Messaging (cMixx)

   📁 5. Modals & Flows
       - Add Meal
       - Add Hydration
       - Add Sleep
       - Add Mood
       - Upload Document
       - Revoke Access
```

---

## C. Component Interaction Map

### Buttons
| Type | Style |
|------|-------|
| Primary | Gradient: Violet → Cyan |
| Secondary | Ghost outline |
| Tertiary | Text-only |

### FWI Component
- **Ring size:** 210px diameter
- **Inner numeric:** 48px bold centered
- **Trend arrow:** 16px
- **State Variants:**
  - Good (green glow)
  - Neutral (amber)
  - Poor (red pulse)

### Vault Tiles
- **Size:** 110×140px
- **Structure:** Icon → filename → lock badge
- **Shadow:** Dark + soft glow

### Messaging (cMixx)
- Metadata-protected badge
- Bubble variations: Sent, Received, PQ Shadow
- E2E encryption indicator

---

## D. Screen Assembly Instructions

### Today Screen
- **Artboard:** 390×844
- **Header:** FWI ring (210px diameter)
- **Body:** 5 metric cards at 2-column layout
- **Gradient:** Violet → Cyan subtle glow
- **Footer:** cMixx / PQ badges

### Medical Vault

**Locked Variant:**
- Center lock: 110px
- Button: "Unlock with Face ID"
- Subtext: "AES-256 + ML-KEM-768 protected"

**Unlocked Variant:**
- 3-column grid
- File tile: 110×140px
- Shadows: dark + soft glow

### Coach Dashboard
- FWI mini ring: 120px
- Trend graph: 7-day smoothing
- Adherence dial (circles)
- No raw logs visible

### Clinician Dashboard
- Pattern Graph view
- Behavioral clusters
- "This view contains no PHI" badge

---

## E. Design Tokens

### Colors
```
--primary: #7C3AED (Violet)
--accent: #22D3EE (Cyan)
--background: #0A0A0C
--surface: #121418
--text-primary: #FFFFFF
--text-secondary: #A0A0A0
```

### Typography
```
Headings: Space Grotesk 600/700
Body: Inter 400/500
Labels: Inter 500 (uppercase)
```

### Spacing Scale
```
4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px
```

### Border Radius
```
Small: 8px
Medium: 12px
Large: 16px
Full: 9999px
```

---

*Figma assembly defined — ready for designer export.*

*Last updated: December 2024*
