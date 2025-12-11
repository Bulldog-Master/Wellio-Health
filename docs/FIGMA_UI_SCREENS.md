# Wellio — Figma UI Screens Blueprint

Complete screen-by-screen specification for UI design.

---

## 1. Onboarding Flow

### Screen 1.1 — Welcome
- Wellio logo centered
- Tagline: "AI-powered wellness, protected by privacy."
- "Get Started" CTA button
- Background: Deep navy gradient

### Screen 1.2 — Privacy Promise
- APP Platform architecture diagram
- Three key points:
  - Your data stays on your device
  - Professionals see insights, not logs
  - Post-quantum encrypted
- "Continue" CTA

### Screen 1.3 — Setup Goals
- Goal selection cards:
  - Improve sleep
  - Track nutrition
  - Build fitness habits
  - Monitor mood
  - Store medical records
- Multi-select enabled
- "Next" CTA

### Screen 1.4 — Security Setup
- PIN creation (6-digit)
- Biometric enable toggle
- Security explanation text
- "Complete Setup" CTA

---

## 2. Today Screen (Dashboard)

### Layout
- **Header:** FWI circle (large) + trend arrow + date
- **Body:** 5 mini-cards in grid
- **Footer:** Quick action FAB

### FWI Component
- Circle ring meter (0-100)
- Score number centered
- Trend indicator (↑ ↓ →)
- Color: Gradient fill based on score

### Mini-Cards
Each card contains:
- Icon (left)
- Label (top)
- Value (center)
- Progress bar (bottom)

**Cards:**
1. Sleep — Moon icon, hours logged
2. Meals — Fork icon, meals logged
3. Hydration — Droplet icon, glasses logged
4. Activity — Flame icon, minutes logged
5. Mood — Heart icon, mood score

### Quick Actions FAB
- "+" icon
- Expands to: Log Meal, Log Sleep, Log Activity, Log Mood

---

## 3. Logging Screens

### Screen 3.1 — Category Tabs
- Tab bar: Sleep | Meals | Hydration | Activity | Mood
- Active tab: Violet underline
- Content area below tabs

### Screen 3.2 — Quick Add Modal
- Category icon (top)
- Input field(s)
- Time selector
- Notes field (optional)
- "Save" CTA

### Screen 3.3 — Timeline View
- Chronological list
- Each entry shows:
  - Time
  - Category icon
  - Value/description
  - Edit icon

---

## 4. Medical Vault

### Screen 4.1 — Locked State
- Lock icon (large, centered)
- "Unlock Vault" CTA
- Biometric prompt or PIN entry
- Security badge: "AES-256 + ML-KEM-768"

### Screen 4.2 — Unlocked State
- Document grid (2-column)
- Each document card:
  - Thumbnail
  - Name
  - Date added
  - Category badge
- "Add Document" FAB

### Screen 4.3 — Add Document Modal
- Upload area (drag/drop or select)
- Document name field
- Category dropdown
- Date picker
- "Encrypt & Save" CTA

---

## 5. Care Team (Professionals)

### Screen 5.1 — Care Team Overview
- Section: "Your Connections"
  - Connected professional cards (if any)
  - Empty state: "No professionals connected"
- Section: "Invite a Professional"
  - "Generate Invite Code" CTA

### Screen 5.2 — Invite Code Screen
- Generated code (large, copyable)
- Role selector: Trainer | Coach | Clinician
- Visibility diagram showing what they'll see
- "Share Code" CTA
- Expiration timer

### Screen 5.3 — Professional Card
- Professional name
- Role badge
- Connected date
- FWI access indicator
- "Revoke Access" option

---

## 6. Messaging (cMixx)

### Screen 6.1 — Conversation List
- Professional conversations
- Each row:
  - Avatar
  - Name
  - Last message preview
  - Time
  - cMixx badge (lock icon)

### Screen 6.2 — Chat View
- **Header:** Professional name + role + badges
- **Badges:**
  - "PQ Secured" (violet)
  - "Metadata Protected" (cyan)
- **Chat area:** Bubble messages
- **Input:** Text field + send button

### Screen 6.3 — Security Info Modal
- Explanation of cMixx
- Explanation of ML-KEM-768
- "What this means for you" section
- "Close" CTA

---

## 7. Settings

### Screen 7.1 — Settings Menu
- Profile section
- Security section (PIN, biometric)
- Privacy section (data controls)
- Notifications section
- About section
- Sign out

### Screen 7.2 — Privacy Controls
- Data retention slider
- Export data CTA
- Delete account CTA
- Consent toggles

---

## 8. Professional Dashboard (Coach/Clinician View)

### Screen 8.1 — Client List
- Client cards in grid
- Each card:
  - Client name (or anonymous ID)
  - FWI score
  - Trend arrow
  - Adherence flags
  - "View Details" CTA

### Screen 8.2 — Client Detail
- FWI trend chart (14/30 days)
- Adherence breakdown
- Secure messaging CTA
- Video session CTA
- Note: "Raw logs not visible"

---

## Component Library Summary

### Buttons
- Primary: Violet gradient fill
- Secondary: Transparent + white stroke
- Text: White text only

### Cards
- Border radius: 16px
- Shadow: 0 4px 20px rgba(0,0,0,0.25)
- Background: Surface color (#1A1C22)

### Badges
- FWI: Circle with score
- Security: Rounded pill with icon
- Role: Colored chip

### Navigation
- Bottom tab bar (mobile)
- Side navigation (desktop)
- FAB for quick actions

---

*Last updated: December 2024*
