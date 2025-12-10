# cMixx Integration Explainer Animations

Storyboard and scripts for After Effects, Figma Motion, or Lottie animations.

---

## Animation 1 — "Metadata Problem"

**Duration:** 6 seconds

### Scene
User sends a message. Lines show: message → server → recipient.  
Metadata icons appear alongside the path: clock (timing), IP address, packet size.

### Caption
> Most encrypted apps still leak metadata.

### Visual Elements
- User icon (left)
- Server icon (center)
- Recipient icon (right)
- Connecting lines with flowing dots
- Metadata icons: 🕐 📍 📦

---

## Animation 2 — "Enter cMixx"

**Duration:** 6 seconds

### Scene
Messages enter a multi-node distributed mixer.  
Multiple paths scramble and interweave.  
Exit points are randomized.

### Caption
> cMixx breaks sender–receiver linkage.

### Visual Elements
- 5-7 mixer nodes in a network pattern
- Message packets entering from multiple sources
- Scrambled, randomized exit paths
- Node glow effect (#7C3AED → #22D3EE gradient)

---

## Animation 3 — "No Timing Patterns"

**Duration:** 6 seconds

### Scene
Left side: Irregular message pulses (variable timing).  
Right side: Uniform timed batches (consistent intervals).

### Caption
> Timing attacks eliminated.

### Visual Elements
- Split screen comparison
- Left: chaotic, irregular pulse pattern
- Right: smooth, uniform batch releases
- Arrow showing transformation

---

## Animation 4 — "Post-Quantum Keys"

**Duration:** 5 seconds

### Scene
ML-KEM-768 key icons form a protective shield around message packets.  
Shield pulses with quantum-resistant glow.

### Caption
> Bootstrap protected from future quantum attacks.

### Visual Elements
- Key pair icons (public/private)
- Shield formation animation
- "ML-KEM-768" label
- Violet/cyan gradient glow

---

## Animation 5 — "Clinician + User Connection"

**Duration:** 6 seconds

### Scene
User and clinician on a video call interface.  
Lines show data flow with labels: "Derived Signals Only"  
No raw data icons cross the barrier.

### Caption
> Private. Compliant. Safe communication.

### Visual Elements
- Two person avatars with video frames
- Data flow lines (FWI, trends, adherence)
- "Raw Data" icons blocked/filtered
- Green checkmarks on compliant data

---

## Final Frame

**Duration:** 3 seconds

### Scene
Wellio logo fades in, centered.  
Tagline appears below.

### Content
```
[WELLIO LOGO]

AI-powered wellness. Quantum-private by design.
```

### Visual Elements
- Logo: Bold "WELLIO" wordmark
- Tagline: Elegant, smaller font
- Subtle particle effect background
- Fade to black or loop restart

---

## Technical Specifications

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Background | #0F1115 | Primary |
| Primary Accent | #7C3AED | Highlights |
| Secondary Accent | #22D3EE | Highlights |
| Text | #FFFFFF | Labels |

### Typography
- **Headlines:** Inter Bold
- **Captions:** Inter Medium
- **Labels:** Inter Regular

### Export Formats
- **Lottie JSON** — Web/mobile integration
- **MP4 (1080p)** — Social media
- **GIF** — Documentation/README
- **After Effects Project** — Source files

### Frame Rates
- Web animations: 30 FPS
- Video exports: 60 FPS

---

## Animation Flow

```
[1] Metadata Problem (6s)
        ↓
[2] Enter cMixx (6s)
        ↓
[3] No Timing Patterns (6s)
        ↓
[4] Post-Quantum Keys (5s)
        ↓
[5] Clinician + User (6s)
        ↓
[Final] Logo + Tagline (3s)
```

**Total Runtime:** ~32 seconds

---

## Usage Contexts

| Context | Format | Notes |
|---------|--------|-------|
| Website Hero | Lottie/MP4 | Loop animations 1-3 |
| Investor Deck | MP4 | Full sequence |
| Social Media | GIF/MP4 | Individual clips |
| Documentation | GIF | Simplified versions |
| App Onboarding | Lottie | Sequential playback |
