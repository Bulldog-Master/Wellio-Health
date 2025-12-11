# Wellio + cMixx Integration

**Metadata-Private Communication Architecture**

> 📄 Download the one-page architecture overview (PDF):  
> [`Wellio_cMixx_Integration_Architecture_OnePager.pdf`](assets/Wellio_cMixx_Integration_Architecture_OnePager.pdf)

## Overview

Wellio is a privacy-first Wellness APP Platform for individuals, with optional connections to friends, family, colleagues, trainers, coaches, and clinicians. Raw data remains strictly on-device, and only derived wellness insights may be shared.

To enable truly private communication between users and their chosen supporters, Wellio integrates **xx network's cMixx protocol**. Unlike traditional encrypted messaging, cMixx removes metadata entirely—preventing adversaries from learning who is communicating, how often, or when.

---

## Why cMixx Is Required

Most encrypted communication platforms still leak:

- Sender and receiver identity
- Communication frequency
- Timing and correlation patterns
- Relationship structures
- Behavioral inferences (e.g., therapy sessions, coaching engagement, relapse patterns)

In wellness and clinical contexts, metadata is itself highly sensitive. cMixx solves this through:

- Sender-receiver unlinkability
- Precomputation-based batching
- Timing obfuscation
- Strong anonymity sets
- Traffic analysis resistance
- Forward-secure PQ-safe design

This is essential for protecting users who engage with:

- Coaches
- Clinicians
- Mental-wellness supporters
- Friends or colleagues in sensitive circumstances

---

## Integration Points

### 1. Derived Insight Delivery

All outbound insight packets (FWI, adherence, trend summaries) are transported through cMixx.
No timestamps, raw logs, or behavioral patterns are leaked.

### 2. Messaging

Every message exchanged with supporters—personal or professional—is routed through the mixnet.
This prevents leakage of:

- Communication intensity
- Sleep/wake cycle inferences
- Program adherence patterns
- Therapeutic escalation windows

### 3. Session Scheduling

Session reminders and check-ins are especially sensitive.
These, too, are delivered exclusively through cMixx.

### 4. Future Real-Time Signaling

Video & voice session signaling will use cMixx for metadata elimination prior to encrypted media transport.

---

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                   ON-DEVICE LAYER                           │
│  • Raw logs           • Journals                            │
│  • FWI computation    • PQ-encrypted Medical Vault          │
│  • No cloud-stored personal data                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               DERIVED INSIGHT LAYER                         │
│  • FWI                • Trend computations                  │
│  • Behavioral adherence metrics                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 cMixx TRANSPORT LAYER                       │
│  • Mixnet batching    • Metadata elimination                │
│  • Traffic unlinkability                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               RECIPIENT INSIGHT LAYER                       │
│  • Supporters: high-level summaries                         │
│  • Coaches/trainers: FWI + trends                           │
│  • Clinicians: functional patterns (no PHI)                 │
└─────────────────────────────────────────────────────────────┘
```

### On-Device Layer

| Component | Description |
|-----------|-------------|
| Raw logs | Personal activity, nutrition, mood data |
| Journals | Private notes and reflections |
| FWI computation | Functional Wellness Index calculated locally |
| Medical Vault | PQ-encrypted (ML-KEM-768) medical records |

### Derived Insight Layer

| Insight | Recipients |
|---------|------------|
| FWI score | All authorized supporters |
| Trend analysis | Coaches, clinicians |
| Adherence metrics | Coaches, clinicians |

### cMixx Transport Layer

| Feature | Benefit |
|---------|---------|
| Mixnet batching | Fixed batch sizes prevent traffic analysis |
| Timing obfuscation | Breaks temporal correlations |
| Multi-hop routing | No single node sees full path |
| Decentralized nodes | No central point of failure |

### Recipient Insight Layer

| Role | Visibility |
|------|------------|
| **Friends/Family/Colleagues** | High-level summaries only |
| **Coaches/Trainers** | FWI + trends + adherence |
| **Clinicians** | Functional patterns (no PHI) |

---

## Privacy Guarantees

| Guarantee | Implementation |
|-----------|----------------|
| ✅ Raw data never leaves user device | On-device computation |
| ✅ Derived insights shareable but anonymous | cMixx transport |
| ✅ Communication relationships fully hidden | Sender-receiver unlinkability |
| ✅ Timing and frequency protected | Batching + obfuscation |
| ✅ Robust against future quantum adversaries | ML-KEM-768 + forward secrecy |

---

## Technical Implementation

### Dependencies

```json
{
  "xxdk-wasm": "^0.3.22",
  "@noble/post-quantum": "^0.5.2"
}
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `useCmixConnection` | `src/hooks/network/` | cMixx network connection |
| `useE2EEncryption` | `src/hooks/encryption/` | E2E encryption layer |
| `careTeamVisibility.ts` | `src/features/care-team/` | Visibility rules |
| `secure_messages` | Database | Encrypted message storage |

### Encryption Protocol

| Version | KEM | AEAD | KDF |
|---------|-----|------|-----|
| v1 | ML-KEM-768 | AES-256-GCM | HKDF-SHA3-256 |

---

## Failure Modes

Wellio follows a **fail-closed** model:

| Scenario | Behavior |
|----------|----------|
| cMixx network unreachable | Messages **not sent** — user notified |
| xxdk WASM fails to load | Messaging **disabled** |
| Key exchange failure | Conversation **not created** |

**Rationale**: Downgrading to plain WebSocket would expose metadata, defeating the privacy promise.

---

## Related Documentation

- [ACCESS_MODEL.md](./ACCESS_MODEL.md) — Who sees what
- [PROFESSIONAL_ECONOMICS.md](./PROFESSIONAL_ECONOMICS.md) — Professional incentives
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) — Security posture

---

## Conclusion

cMixx is foundational to Wellio's mission. It enables a multi-role wellness support ecosystem—friends, family, colleagues, coaches, and clinicians—without exposing relationships, behavioral cycles, or identity metadata.

Wellio becomes a flagship real-world demonstration of **metadata-private, post-quantum wellness technology** built on xx network infrastructure.

---

## References

- [xx.network Documentation](https://xx.network/docs)
- [cMixx Whitepaper](https://xx.network/whitepaper)
- [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum)
- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
