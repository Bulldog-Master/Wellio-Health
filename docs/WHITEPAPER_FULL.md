# WELLIO

## THE PRIVACY-FIRST WELLNESS APP PLATFORM

### A Technical & Architectural Whitepaper

---

## 1. Executive Summary

Wellio is a Wellness APP Platform for individuals who want to understand and improve their wellbeing while maintaining complete control over their personal data. Unlike conventional wellness or tracking apps, Wellio does not upload raw logs, journals, or sensitive information to servers. Instead, it uses an on-device processing model, optional derived-signal sharing, post-quantum encryption, and metadata-resistant communication via cMixx.

The design ensures users stay in complete control, while enabling optional support from trainers, coaches, and clinicians—without exposing private logs or generating PHI risk.

---

## 2. APP Platform Overview

Wellio is built on three pillars:

### 2.1 Individual Wellness Engine
- FWI (Functional Wellness Index)
- Today Dashboard
- Wellness Logs
- Encrypted Medical Vault
- AI Wellness Companion

### 2.2 Optional Professional Extension Layer

A user may invite:
- Trainers/Coaches
- Clinicians

Professionals only see derived insights, not raw logs.

### 2.3 Zero-Trust Privacy Infrastructure
- ML-KEM-768 post-quantum encryption
- AES-256-GCM data vault
- cMixx for metadata elimination
- On-device computation for logs & FWI

---

## 3. Privacy Principles

### 3.1 Data Minimization
Only essential derived insights are shared.

### 3.2 User Sovereignty
Users explicitly invite and revoke professional visibility.

### 3.3 Zero PHI Exposure
Even clinicians cannot see PHI or raw data.

### 3.4 Zero Metadata Leakage
All communication through cMixx anonymizes traffic patterns.

### 3.5 Post-Quantum Security First
Future-proof encryption across the platform.

---

## 4. Architecture Overview

### 4.1 On-Device Components
- Logging engine
- FWI scoring engine
- AI local prompt adapter
- Encrypted vault local storage

### 4.2 Server-Side Components
- Authentication & tokens
- Professional role registry
- Derived-signal APIs
- No raw data endpoints exist

### 4.3 Network Layer
- cMixx routing for all messaging and session signals
- PQ key establishment via ML-KEM-768

---

## 5. Data Flow

### 5.1 Individual User Flow
1. User logs sleep, meals, hydration, etc.
2. Logs remain stored encrypted locally.
3. FWI is computed on-device.
4. Only FWI + derived trends (graphs, adherence) may optionally sync.

### 5.2 Professional Flow
1. User invites a professional.
2. Professional receives derived signals only.
3. Raw logs, vault items, journals → never transmitted.
4. Sessions & messaging travel through cMixx.

---

## 6. Derivation Model (FWI)

FWI uses:
- Sleep quality & duration
- Consistency metrics
- Nutrition adherence
- Hydration logs
- Movement patterns
- Mood entries

Each factor contributes to a weighted composite score.
Weights are configurable per population or program.

### 6.1 FWI Calculation

```
FWI = (Sleep × 0.15) + (Hydration × 0.20) + (Mood × 0.25) + (Workout × 0.40)
```

Score is normalized to 0-100 range with clamp function.

---

## 7. Cryptography Stack

### 7.1 ML-KEM-768
- Used for PQ-safe key establishment
- Ensures long-term confidentiality
- Resistant to Shor's algorithm & Grover-accelerated attacks

### 7.2 AES-256-GCM
- Used for local vault encryption
- Used for secure on-device data stores

### 7.3 cMixx
- Multi-node mix network
- Eliminates metadata
- Prevents timing attacks
- Used for messaging & signaling

---

## 8. Threat Model

### 8.1 What Wellio Protects Against
- Cloud compromise
- Server-side breaches
- Metadata profiling
- Insider access
- Machine learning inference attacks
- Future quantum decryption

### 8.2 What Wellio Does Not Do
- Does not replace clinical EMRs
- Does not diagnose or treat
- Does not store PHI

---

## 9. Professional Extension Boundaries

| Data Type | Individual | Trainer | Coach | Clinician |
|-----------|------------|---------|-------|-----------|
| Raw logs | ✅ | ❌ | ❌ | ❌ |
| FWI score | ✅ | ✅ | ✅ | ✅ |
| Trends | ✅ | ✅ | ✅ | ✅ |
| Adherence flags | ✅ | ✅ | ✅ | ✅ |
| Medical vault | ✅ | ❌ | ❌ | ❌ |
| Metadata | ✅ | ❌ | ❌ | ❌ |

---

## 10. Compliance Considerations

Because Wellio does not store PHI, and because clinicians only see derived signals without identifiers, the APP Platform significantly reduces compliance burden.

### 10.1 Regulatory Alignment
- **GDPR:** Data minimization, user control
- **HIPAA:** PHI avoidance through derived signals
- **CCPA:** User data ownership
- **PIPEDA:** Canadian privacy compliance

---

## 11. Security Implementation

### 11.1 Tiered Encryption Strategy

| Tier | Algorithm | Use Case |
|------|-----------|----------|
| V3 | ML-KEM-768 | Medical records, sensitive health data |
| V2 | AES-256-GCM | Messages, PII, payment metadata |
| V1 | Standard RLS | Media files, general content |

### 11.2 Zero-Trust Architecture
- Servers cannot decrypt user data
- All server-stored data consists of opaque ciphertext blobs
- Anonymous session tokens
- Encrypted metadata envelopes

---

## 12. Roadmap

### Phase 1: Foundation
- FWI + Vault
- Basic logging
- On-device encryption

### Phase 2: Professional Extensions
- Trainer/Coach portal
- Clinician portal
- Invite code system

### Phase 3: Advanced Features
- Wearable integrations
- Expanded FWI models
- AI voice companion

### Phase 4: Scale
- Privacy-preserving analytics
- Additional cMixx routing modes
- Decentralized identity

---

## 13. Conclusion

Wellio introduces an unprecedented Wellness APP Platform architecture—one that elevates user privacy, supports behavior change, and enables safe collaboration with wellness professionals.

The combination of post-quantum cryptography, metadata elimination, and derived-signal sharing creates a new category: **privacy-preserving wellness collaboration**.

---

## 14. Glossary

| Term | Definition |
|------|------------|
| FWI | Functional Wellness Index — aggregated wellness score |
| ML-KEM-768 | Post-quantum key encapsulation mechanism (NIST FIPS 203) |
| cMixx | xx.network metadata protection protocol |
| PHI | Protected Health Information |
| Zero-trust | Architecture assuming no trusted components |
| Derived signals | Aggregated insights computed from raw data |
| APP Platform | Wellio's multi-actor wellness ecosystem |

---

## 15. References

- NIST Post-Quantum Cryptography Standards (FIPS 203, 204)
- xx.network cMixx Protocol Specification
- GDPR Article 25: Data Protection by Design
- HIPAA Privacy Rule (45 CFR Part 160 and Subparts A and E of Part 164)

---

*Document Version: 1.0*
*Last Updated: December 2024*
