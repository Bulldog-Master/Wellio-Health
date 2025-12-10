# Wellio Image Specifications

Production-ready image descriptions for Figma, Photoshop, or AI image generators.

---

## A. README Banner — "Wellio Quantum-Private Wellness"

**Filename:** `wellio-readme-banner.png`  
**Resolution:** 2880×900  
**Style:** Clean, dark, premium, futuristic

### Description / Prompt:

Wide hero banner with a deep black → midnight gradient (#000 → #0D0F14). On the left: bold "WELLIO" in white, large, modern typography. Subheadline: "AI-powered wellness. Quantum-private by design." Beneath: three glowing violet/cyan pill badges reading: Functional Wellness Index, Care Team, Post-Quantum Security.

On the right: a sleek smartphone mockup displaying the Wellio home screen (circle FWI score, trend sparkline, adherence rings). Soft violet/cyan glow behind the phone.

---

## B. Care Team Access Model Diagram

**Filename:** `care-team-access-model.png`  
**Resolution:** 2400×1600

### Description:

Three stacked horizontal layers:
- **Bottom layer:** "User Device (Raw Data — Never Shared)" with icons for meal logs, workouts, journals, medical documents
- **Middle layer:** "Wellio Derivation Engine — FWI, Adherence, Trends Only"
- **Top layer:** Split into two cards: "Coach View" and "Clinician View," each showing only FWI, trends, adherence (no raw data)

Arrows show privacy-preserving flow upward. Bottom-right PQ security badge: "ML-KEM-768 · cMixx Metadata Protection."

---

## C. Clinician Dashboard Mock

**Filename:** `clinician-dashboard-mock.png`  
**Resolution:** 1920×1080

### Description:

Dark professional UI with a header: "Clinician Dashboard — Derived signals only. No PHI."

- **Left:** Grid of patient cards with FWI score, trend pill, flags, "Open Profile" button
- **Right:** Video Sessions (Join button), Secure Messages preview

Colors: #0F1115 background with violet/cyan accents (#7C3AED, #22D3EE).

---

## D. Professional Tier Badges

All badges use rounded pill shape with gradient border (#7C3AED → #22D3EE) on dark background.

| Filename | Text |
|----------|------|
| `badge-coach-pro.png` | Coach Pro |
| `badge-coach-team.png` | Coach Team |
| `badge-clinician-individual.png` | Clinician Individual |
| `badge-clinician-group.png` | Clinician Group |

---

## E. cMixx Security Architecture Diagram

**Filename:** `cmixx-security-architecture.png`  
**Resolution:** 2200×1400

### Description:

Multi-node mixnet diagram showing messages entering and leaving a cMixx pipeline. Anonymity sets, node groups, batching intervals.

Labels:
- "Metadata eliminated"
- "Timing unlinkability"
- "Traffic obfuscation"
- "PQ key bootstrap (ML-KEM-768)"

---

## Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Background Dark | #0F1115 | Primary background |
| Background Gradient | #000 → #0D0F14 | Hero banners |
| Primary Violet | #7C3AED | Accents, badges |
| Primary Cyan | #22D3EE | Accents, highlights |
| Text White | #FFFFFF | Headlines |
| Text Muted | #9CA3AF | Subtext |

---

## Typography

- **Headlines:** Inter Bold, 48-72px
- **Subheadlines:** Inter Medium, 24-32px
- **Body:** Inter Regular, 16-18px
- **Badges:** Inter Semibold, 14px
