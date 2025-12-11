# Wellio Full App UI Assembly in Figma

## Screen-by-Screen Build Plan (Handoff-Ready)

---

## FIGMA PROJECT STRUCTURE

```
Wellio – Wellness APP Platform
│
├── 1. Foundations
│   ├── Colors
│   ├── Typography
│   ├── Radius & Shadows
│   └── Iconography System
│
├── 2. Components
│   ├── Buttons
│   ├── Cards
│   ├── FWI Ring
│   ├── List Cells
│   ├── Vault Tiles
│   ├── Pro Insights Widgets
│   └── Messaging Bubbles
│
├── 3. Screens – Individual
│   ├── Welcome
│   ├── Permissions
│   ├── Today
│   ├── Logs (5 subscreens)
│   ├── Medical Vault (locked/unlocked)
│   ├── AI Assistant
│   ├── Settings
│   └── Notifications
│
├── 4. Screens – Professionals
│   ├── Invite Code Entry
│   ├── Care Team
│   ├── Coach Dashboard
│   ├── Clinician Dashboard
│   ├── Session View
│   └── Messaging (cMixx)
│
└── 5. Modals & Flows
    ├── Add Meal
    ├── Add Hydration
    ├── Add Sleep
    ├── Add Mood
    ├── Upload Document
    ├── Revoke Access
    └── Pro Onboarding Flow
```

---

## 1. FOUNDATIONS

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary-black` | #0D0F14 | Primary background |
| `--surface-gray` | #1A1C22 | Card backgrounds |
| `--light-surface` | #20232B | Elevated surfaces |
| `--wellness-violet` | #7C3AED | Primary accent |
| `--wellness-cyan` | #22D3EE | Secondary accent |
| `--success` | #23E08A | Positive states |
| `--warning` | #FFB84D | Caution states |
| `--alert` | #FF4C61 | Error states |

### Typography
| Style | Font | Weight | Size |
|-------|------|--------|------|
| H1 | Space Grotesk | Bold | 48px |
| H2 | Space Grotesk | Bold | 36px |
| H3 | Space Grotesk | SemiBold | 24px |
| H4 | Space Grotesk | SemiBold | 20px |
| Body | Inter | Regular | 16px |
| Caption | Inter | Regular | 14px |
| Small | Inter | Regular | 12px |

### Radius & Shadows
| Element | Radius | Shadow |
|---------|--------|--------|
| Buttons | 12px | None |
| Cards | 16px | 0 4px 12px rgba(0,0,0,0.20) |
| Vault Tiles | 20px | 0 8px 28px rgba(0,0,0,0.30) |
| Modals | 24px | 0 16px 48px rgba(0,0,0,0.40) |

### Iconography
- **Library:** Lucide React
- **Style:** Rounded, 2px stroke
- **Sizes:** 16px, 20px, 24px, 32px

---

## 2. COMPONENTS

### Buttons
| Variant | Background | Text | Border |
|---------|------------|------|--------|
| Primary | Gradient (violet→cyan) | White | None |
| Secondary | Transparent | White | 1px white |
| Ghost | Transparent | White | None |
| Danger | #FF4C61 | White | None |

### Cards
- **Padding:** 16px
- **Gap:** 12px internal
- **Radius:** 16px
- **Background:** `--surface-gray`

### FWI Ring Component
- **Diameter:** 210px (large), 80px (small)
- **Ring Thickness:** 18px (large), 8px (small)
- **Segments:** Sleep, Nutrition, Movement, Mood
- **Center:** Score number + trend arrow

### List Cells
- **Height:** 64px
- **Icon:** 24px (left)
- **Label:** Body text
- **Timestamp:** Caption (right)
- **Divider:** 1px `--surface-gray`

### Vault Tiles
- **Size:** 110 × 140px
- **Icon:** File type indicator
- **Label:** Filename (truncated)
- **Badge:** Encryption status

### Messaging Bubbles
- **Max Width:** 80%
- **Radius:** 12px
- **Sent:** Right-aligned, violet tint
- **Received:** Left-aligned, surface gray

---

## 3. SCREENS – INDIVIDUAL

### Welcome Screen
- Logo (centered, 80px)
- Title: H1
- Subtitle: Body
- CTA Button: Full width
- Footer: Security badges

### Permissions Screen
- Header: H2
- Toggle list (3 items)
- Continue button
- Skip link

### Today Screen
- **Artboard:** 390×844px (iPhone 14 Pro)
- **Header:** FWI ring (210px diameter, centered top)
- **Layout:** 5 metric cards at 2-column layout
- **Gradient:** Violet → Cyan subtle glow behind FWI
- **Footer:** cMixx / PQ badges
- **Card grid:** 2 columns, 16px gap
- **Bottom navigation:** 64px height
- Quick action FAB

### Logs Screens (5 subscreens)
- Tab navigation
- List view (entries)
- FAB: Add new
- Filter/search bar

### Medical Vault

**Locked State:**
- Center lock: 110px
- Button: "Unlock with Face ID"
- Subtext: "AES-256 + ML-KEM-768 protected"
- Background: Dark with subtle security pattern

**Unlocked State:**
- Layout: 3-column grid
- File tile: 110×140px
- Shadows: Dark + soft glow
- Security badge visible at top

### AI Assistant
- Chat interface
- Message input
- Suggestion chips
- Privacy indicator

### Settings
- Section groups
- Toggle rows
- Navigation rows
- Footer: Version info

### Notifications
- List view
- Notification cards
- Read/unread states
- Clear all action

---

## 4. SCREENS – PROFESSIONALS

### Invite Code Entry
- Header: H2
- Code input field
- Submit button
- Help link

### Care Team
- Connected professionals list
- Invite button
- Visibility settings
- Revoke access option

### Coach Dashboard
- **FWI mini ring:** 120px diameter
- **Trend graph:** 7-day smoothing visualization
- **Adherence dial:** Circular progress indicators
- **Privacy indicator:** "No raw logs" badge
- **Client list:** Avatar + FWI + trend arrow

### Clinician Dashboard
- **Pattern Graph view:** Behavioral clusters visualization
- **Privacy badge:** "This view contains no PHI" prominent
- **Functional signals:** Derived metrics only
- **14-day trend:** Line chart with confidence bands

### Session View
- Video frame (16:9)
- Controls bar
- Chat sidebar
- End session button

### Messaging (cMixx)
- Header: "Metadata Protected"
- Chat bubbles
- E2E encryption indicator
- Message input

---

## 5. MODALS & FLOWS

### Add Meal Modal
- Food input field
- Portion selector
- Time picker
- Save/Cancel buttons

### Add Hydration Modal
- Amount slider
- Drink type selector
- Quick add buttons
- Save/Cancel buttons

### Add Sleep Modal
- Bedtime picker
- Wake time picker
- Quality rating
- Notes field

### Add Mood Modal
- Mood selector (5 options)
- Energy slider
- Stress slider
- Notes field

### Upload Document Modal
- File picker
- Category selector
- Date field
- Encryption confirmation

### Revoke Access Modal
- Confirmation message
- Professional name
- Revoke button
- Cancel button

### Pro Onboarding Flow
1. Role selection
2. Credentials upload
3. Profile setup
4. Terms acceptance
5. Dashboard redirect

---

## DESIGNER TIMELINE ESTIMATE

With this assembly plan, a designer can build the entire Wellio interface in **3–5 days**.

---

## EXPORT SPECIFICATIONS

### Formats
- **Design:** Figma (.fig)
- **Handoff:** Figma Dev Mode
- **Assets:** SVG, PNG @2x

### Naming Convention
```
wellio-[section]-[screen]-[state].fig
wellio-individual-today-default.fig
wellio-pro-coach-dashboard-empty.fig
```

### Version Control
- Main branch: Production-ready
- Dev branch: Work in progress
- Tag releases: v1.0, v1.1, etc.

---

*Last updated: December 2024*
