# Visual Assets Specifications

Design blueprints for Figma/Sketch implementation.

---

## Asset 1: Access Model Diagram

**Filename:** `access-model-wellio.svg`

### Layout
- **Canvas:** 1600×900, dark background `#050608`
- **Three vertical layers, center aligned:**

#### 1. Bottom: User Device (Raw Data)
- Rounded rectangle with subtle glow
- Icons inside: notebook, dumbbell, plate, water drop, moon
- **Title:** "User Device"
- **Subtitle:** "Raw logs, meal notes, workouts, journals, documents — never leave the device."

#### 2. Middle: Wellio Derivation Layer
- Slightly smaller rounded rect with violet/cyan glow (`#7C3AED` → `#22D3EE`)
- Icons: FWI ring gauge, bar chart
- **Title:** "Wellio Derivation Layer"
- **Subtitle:** "Functional Wellness Index, adherence, trends."

#### 3. Top: Professional View
- Two small cards side-by-side: "Coach" and "Clinician"
- Each shows only FWI + tiny sparkline
- **Text:** "Derived signals only. No raw logs. No PHI."

### Arrows
- Upward arrow from "User Device" → "Derivation Layer" labeled "Local processing"
- Upward arrow from "Derivation Layer" → "Professional View" labeled "Derived signals only"

### Badges (bottom-right)
- "Post-Quantum Encryption (ML-KEM-768)"
- "Metadata Protection (xx.network cMixx)"

---

## Asset 2: Professional Flywheel

**Filename:** `professional-flywheel.svg`

### Layout
Circular flow with 5 nodes:

1. **Users install Wellio** →
2. **They connect a coach/clinician** →
3. **Pros get FWI & trends** →
4. **Pros deliver better results** →
5. **Pros invite more clients** → back to 1

### Node Style
- Circular pill with icon + label
- Arrow between nodes with motion hint (gradient stroke)

### Center Text
"Growth driven by professionals, not ads."

---

## Asset 3: Clinician Dashboard Hero

**Filename:** `clinician-dashboard-hero.png`

### Mock Layout
- **Left:** FWI gauge + 30-day trend
- **Right top:** Adherence tiles (sleep, meals, hydration, activity, mood)
- **Right bottom:** Upcoming video sessions, secure messages snippet
- **Badge:** "Clinician View – Derived Signals Only"

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#050608` | Primary dark background |
| Surface | `#0B0B0D` | Card backgrounds |
| Accent Primary | `#7C3AED` | Violet highlights |
| Accent Secondary | `#22D3EE` | Cyan accents |
| Text Primary | `#FFFFFF` | Headings |
| Text Muted | `#A1A1AA` | Descriptions |
| Success | `#22C55E` | Positive indicators |
| Warning | `#F59E0B` | Caution indicators |
| Danger | `#EF4444` | Risk indicators |

---

## Typography

- **Headings:** Inter/Space Grotesk, Bold
- **Body:** Inter, Regular
- **Labels:** Inter, Medium, 11-12px
- **Badges:** Inter, Medium, 10-11px, uppercase
