# Wellio — Hero Animations & Motion Storyboards

Production-ready animation specifications for website and marketing.

---

## Animation 1 — APP Platform Architecture

### Concept
Shows the layered architecture from individual to professional extensions to security layers.

### Storyboard

**Frame 1 (0-2s)**
- Individual user icon appears center
- Pulse animation
- Caption: "You"

**Frame 2 (2-4s)**
- FWI circle animates around user
- Score fills to 85
- Caption: "Your Wellness Score"

**Frame 3 (4-6s)**
- Optional professional icons appear (Coach, Clinician)
- Dotted lines connect to user
- Caption: "Optional Support"

**Frame 4 (6-8s)**
- Security shield layer appears
- PQ badge animates in
- Caption: "Post-Quantum Protected"

**Frame 5 (8-10s)**
- cMixx nodes appear as outer layer
- Traffic lines animate through nodes
- Caption: "Metadata Eliminated"

**Final Frame (10-12s)**
- All layers visible
- Wellio logo appears
- Caption: "Wellio — Privacy-First Wellness"

### Technical Specs
- Duration: 12 seconds
- Loop: Yes (with 2s pause)
- Format: Lottie JSON / MP4
- Colors: Violet (#7C3AED), Cyan (#22D3EE), Navy (#0D0F14)

---

## Animation 2 — Privacy Layer Reveal

### Concept
Data attempts to leave device but is blocked by encryption shield.

### Storyboard

**Frame 1 (0-2s)**
- Phone mockup appears
- Data particles inside phone
- Caption: "Your Data"

**Frame 2 (2-4s)**
- Data particles try to exit phone
- Arrow pointing toward cloud icon
- Caption: "Traditional Apps"

**Frame 3 (4-6s)**
- Shield appears, blocks data
- Red X on cloud icon
- Caption: "Wellio Blocks Transfer"

**Frame 4 (6-8s)**
- PQ encryption badge animates
- Lock icon on phone
- Caption: "Encrypted On-Device"

**Final Frame (8-10s)**
- Phone with lock, shield around it
- Caption: "Your data stays on your device."

### Technical Specs
- Duration: 10 seconds
- Loop: Yes
- Format: Lottie JSON / SVG animation

---

## Animation 3 — Invite a Professional

### Concept
User generates invite code, professional receives limited visibility.

### Storyboard

**Frame 1 (0-2s)**
- User avatar with phone
- Caption: "Generate Invite Code"

**Frame 2 (2-4s)**
- Code appears (6 characters)
- Share animation
- Caption: "Share With Professional"

**Frame 3 (4-6s)**
- Professional avatar receives code
- Enters code
- Caption: "Professional Joins"

**Frame 4 (6-8s)**
- Split screen:
  - Left: User's full data (logs, vault, notes)
  - Right: Professional's view (FWI only)
- Caption: "They see insights, not your logs."

**Final Frame (8-10s)**
- Both avatars connected
- Limited visibility indicator
- Caption: "Support with boundaries."

### Technical Specs
- Duration: 10 seconds
- Loop: Optional
- Format: Lottie JSON / MP4

---

## Animation 4 — FWI Score Animation

### Concept
Circle meter fills with score, trend arrow appears.

### Storyboard

**Frame 1 (0-1s)**
- Empty circle ring
- "0" in center

**Frame 2 (1-3s)**
- Ring fills progressively
- Score counts up
- Color gradient fills (red → yellow → green)

**Frame 3 (3-4s)**
- Final score lands (e.g., 82)
- Trend arrow appears (↑)
- Caption: "Your Functional Wellness Index"

**Final Frame (4-5s)**
- Score pulses softly
- Mini breakdown appears below

### Technical Specs
- Duration: 5 seconds
- Loop: No (trigger on scroll)
- Format: SVG animation / Lottie

---

## Animation 5 — cMixx Network Visualization

### Concept
Messages route through mix network nodes, eliminating metadata.

### Storyboard

**Frame 1 (0-2s)**
- Two user avatars (sender, receiver)
- Direct line between them
- Caption: "Traditional Messaging"

**Frame 2 (2-4s)**
- Line turns red
- Metadata labels appear: "Who, When, How Often"
- Caption: "Exposes Patterns"

**Frame 3 (4-6s)**
- cMixx nodes appear in middle
- Line breaks into multiple paths through nodes
- Caption: "cMixx Routing"

**Frame 4 (6-8s)**
- Messages travel through different nodes
- Random timing, random paths
- Caption: "Patterns Eliminated"

**Final Frame (8-10s)**
- Green secure connection
- "Metadata Protected" badge
- Caption: "Message without surveillance."

### Technical Specs
- Duration: 10 seconds
- Loop: Yes
- Format: Lottie JSON / WebGL

---

## Animation 6 — Encryption Comparison

### Concept
Shows difference between standard encryption and post-quantum encryption.

### Storyboard

**Frame 1 (0-3s)**
- Standard lock icon
- Caption: "Today's Encryption"

**Frame 2 (3-6s)**
- Quantum computer icon appears
- Lock breaks/cracks
- Caption: "Vulnerable to Future Quantum"

**Frame 3 (6-9s)**
- New lock icon (ML-KEM badge)
- Quantum computer bounces off
- Caption: "Post-Quantum Encryption"

**Final Frame (9-12s)**
- Wellio shield with PQ badge
- Caption: "Protected Today and Tomorrow"

### Technical Specs
- Duration: 12 seconds
- Loop: Optional
- Format: Lottie JSON / MP4

---

## Implementation Notes

### Hero Section Animation
- Use Animation 1 or 2 as primary hero
- Trigger on page load
- Fallback to static image on slow connections

### Feature Section Animations
- Use Animations 3-6 for feature explanations
- Trigger on scroll into view
- Reduce motion for accessibility preference

### Performance
- Lazy load animations below fold
- Provide prefers-reduced-motion alternatives
- Target < 100KB per Lottie file

---

*Last updated: December 2024*
