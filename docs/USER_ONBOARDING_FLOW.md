# Wellio — User Onboarding Flow

Complete onboarding journey and tutorial screen specifications.

---

## Onboarding Philosophy

**Goal:** Transform new users into engaged wellness trackers within 5 minutes

**Principles:**
1. Privacy-first messaging from screen one
2. Value demonstration before account creation
3. Progressive disclosure of features
4. Immediate "aha moment" with FWI

---

## Screen Flow

```
Welcome → Privacy Promise → Goals → Security Setup → FWI Preview → Today Screen
```

---

## Screen 1: Welcome

### Layout
```
┌─────────────────────────────────┐
│                                 │
│          [Wellio Logo]          │  <- Animated entrance
│                                 │
│    A Wellness APP Platform      │  <- H1, fade in
│    Built Around Privacy         │
│                                 │
│    Your wellness.               │  <- Subtitle
│    Your data.                   │
│    Your control.                │
│                                 │
│                                 │
│       [Get Started]             │  <- Primary CTA
│                                 │
│    Already have an account?     │
│         [Sign In]               │
│                                 │
│   ┌─────────────────────────┐   │
│   │ 🔐 PQ    🛡️ cMixx    0️⃣  │   │  <- Trust badges
│   └─────────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### Copy
- **Title:** "A Wellness APP Platform Built Around Privacy"
- **Subtitle:** "Your wellness. Your data. Your control."
- **CTA:** "Get Started"
- **Secondary:** "Already have an account? Sign In"

### Animations
- Logo: Scale in from 0.5 to 1.0, 0.5s ease-out
- Title: Fade up, 0.3s delay
- Badges: Slide up from bottom, 0.5s delay

---

## Screen 2: Privacy Promise

### Layout
```
┌─────────────────────────────────┐
│  ←                              │  <- Back arrow
│                                 │
│    How Wellio Is Different      │  <- H2
│                                 │
│  ┌─────────────────────────┐    │
│  │  📱                      │    │
│  │  Your Data Stays         │    │
│  │  On Your Device          │    │
│  │                          │    │
│  │  Raw logs, journals,     │    │
│  │  and notes never leave   │    │
│  │  your phone.             │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  👥                      │    │
│  │  Professionals See       │    │
│  │  Insights, Not Logs      │    │
│  │                          │    │
│  │  If you invite support,  │    │
│  │  they see trends only.   │    │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  🔐                      │    │
│  │  Post-Quantum            │    │
│  │  Protected               │    │
│  │                          │    │
│  │  Encryption that works   │    │
│  │  today and tomorrow.     │    │
│  └─────────────────────────┘    │
│                                 │
│       [I Understand]            │
│                                 │
│         ○ ● ○ ○ ○               │  <- Progress dots
│                                 │
└─────────────────────────────────┘
```

### Copy
- **Title:** "How Wellio Is Different"
- **Card 1:** "Your Data Stays On Your Device"
- **Card 2:** "Professionals See Insights, Not Logs"
- **Card 3:** "Post-Quantum Protected"
- **CTA:** "I Understand"

### Interactions
- Cards animate in sequentially (0.2s stagger)
- Each card has subtle gradient border
- Swipe or button to continue

---

## Screen 3: Set Your Goals

### Layout
```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│    What Do You Want             │
│    To Improve?                  │  <- H2
│                                 │
│    Select all that apply        │  <- Subtitle
│                                 │
│  ┌─────────────────────────┐    │
│  │  🌙  Better Sleep        │ ○  │  <- Toggle
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  🍎  Healthier Eating    │ ○  │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  💧  More Hydration      │ ○  │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  🏃  Regular Activity    │ ○  │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  😊  Mood Tracking       │ ○  │
│  └─────────────────────────┘    │
│                                 │
│  ┌─────────────────────────┐    │
│  │  🏥  Medical Records     │ ○  │
│  └─────────────────────────┘    │
│                                 │
│       [Continue]                │
│                                 │
│         ○ ○ ● ○ ○               │
│                                 │
└─────────────────────────────────┘
```

### Copy
- **Title:** "What Do You Want To Improve?"
- **Subtitle:** "Select all that apply"
- **Options:** Sleep, Eating, Hydration, Activity, Mood, Medical Records
- **CTA:** "Continue" (enabled after 1+ selection)

### Interactions
- Multi-select toggle
- Selected state: Primary color fill + checkmark
- Haptic feedback on selection

---

## Screen 4: Security Setup

### Layout
```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│    Secure Your Wellio           │  <- H2
│                                 │
│    Your vault and private       │
│    data need protection.        │  <- Subtitle
│                                 │
│  ┌─────────────────────────┐    │
│  │                          │    │
│  │     [Face ID Icon]       │    │
│  │                          │    │
│  │  Enable Face ID          │    │
│  │                          │    │
│  │  Fastest way to unlock   │    │
│  │  your vault securely.    │    │
│  │                          │    │
│  │     [Enable]             │    │
│  │                          │    │
│  └─────────────────────────┘    │
│                                 │
│        or set up a PIN          │
│                                 │
│  ┌─────────────────────────┐    │
│  │  [ ] [ ] [ ] [ ] [ ] [ ] │    │  <- 6-digit PIN
│  └─────────────────────────┘    │
│                                 │
│       [Continue]                │
│                                 │
│    Skip for now (not recommended)│
│                                 │
│         ○ ○ ○ ● ○               │
│                                 │
└─────────────────────────────────┘
```

### Copy
- **Title:** "Secure Your Wellio"
- **Subtitle:** "Your vault and private data need protection."
- **Biometric:** "Enable Face ID" / "Enable Touch ID"
- **Alternative:** "or set up a PIN"
- **Skip:** "Skip for now (not recommended)"

### Interactions
- Biometric prompt triggers system dialog
- PIN entry with visual feedback
- Skip shows warning modal

---

## Screen 5: Your First FWI

### Layout
```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│    Meet Your FWI                │  <- H2
│                                 │
│    Your Functional Wellness     │
│    Index combines your daily    │
│    habits into one score.       │
│                                 │
│         ┌─────────┐             │
│         │         │             │
│         │   --    │             │  <- Empty FWI circle
│         │         │             │
│         └─────────┘             │
│                                 │
│    Log your first entry         │
│    to see your score.           │
│                                 │
│  ┌───────┐ ┌───────┐ ┌───────┐  │
│  │  🌙   │ │  🍎   │ │  💧   │  │  <- Quick log
│  │ Sleep │ │ Meal  │ │ Water │  │
│  └───────┘ └───────┘ └───────┘  │
│                                 │
│    [I'll Log Later]             │
│                                 │
│         ○ ○ ○ ○ ●               │
│                                 │
└─────────────────────────────────┘
```

### Copy
- **Title:** "Meet Your FWI"
- **Explanation:** "Your Functional Wellness Index combines your daily habits into one score."
- **Prompt:** "Log your first entry to see your score."
- **Skip:** "I'll Log Later"

### Interactions
- Tapping quick log opens simplified entry modal
- After entry, FWI circle animates to show score
- "Aha moment" — user sees immediate value

---

## Screen 6: Welcome Complete

### Layout
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│          ✨                      │  <- Celebration animation
│                                 │
│    You're All Set!              │  <- H1
│                                 │
│    Your wellness journey        │
│    starts now — privately.      │
│                                 │
│                                 │
│    What to do next:             │
│                                 │
│    ☐ Log your first meal        │
│    ☐ Track last night's sleep   │
│    ☐ Check your FWI tonight     │
│                                 │
│                                 │
│       [Start Tracking]          │  <- Primary CTA
│                                 │
│                                 │
└─────────────────────────────────┘
```

### Copy
- **Title:** "You're All Set!"
- **Subtitle:** "Your wellness journey starts now — privately."
- **Checklist:** First actions to build habit
- **CTA:** "Start Tracking"

### Animations
- Confetti burst
- Checkmarks animate in
- Button pulses once

---

## Post-Onboarding: Tooltips

### First Visit to Today Screen
- Tooltip on FWI: "This is your daily wellness score"
- Tooltip on cards: "Tap to log or view details"
- Tooltip on FAB: "Quick-add any log here"

### First Professional Invite
- Modal: "Ready to add a professional?"
- Explanation of what they'll see
- CTA: "Generate Invite Code" / "Not Yet"

### First Vault Access
- Biometric prompt
- Success message: "Vault unlocked"
- Tooltip: "Your documents are encrypted end-to-end"

---

## Metrics & Optimization

### Onboarding Completion Targets
| Screen | Target Completion |
|--------|-------------------|
| Welcome | 95% |
| Privacy Promise | 90% |
| Goals | 85% |
| Security | 80% |
| First FWI | 75% |
| Complete | 70% |

### Drop-off Interventions
- Screen 3 drop-off → Simplify goal selection
- Screen 4 drop-off → Make skip more visible
- Screen 5 drop-off → Reduce friction in quick log

---

*Last updated: December 2024*
