# Wellio — Privacy & Security Materials

Marketing and compliance materials for privacy positioning.

---

## Zero-Trust Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER DEVICE                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    LOCAL STORAGE                             │    │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────────────────┐   │    │
│  │  │ Raw Logs  │  │ FWI Data  │  │ Medical Vault         │   │    │
│  │  │ (Private) │  │ (Private) │  │ (AES-256 + ML-KEM)    │   │    │
│  │  └───────────┘  └───────────┘  └───────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                              │                                       │
│                    ┌─────────┴─────────┐                            │
│                    │ Derived Signals   │                            │
│                    │ (Optional Export) │                            │
│                    └─────────┬─────────┘                            │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
                    ┌──────────┴──────────┐
                    │   cMixx NETWORK     │
                    │   (Metadata Layer)  │
                    └──────────┬──────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                         WELLIO SERVERS                               │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    CANNOT ACCESS:                            │    │
│  │  ❌ Raw Logs       ❌ Journals      ❌ Medical Vault         │    │
│  │  ❌ Meal Notes     ❌ Sleep Diary   ❌ Personal Notes        │    │
│  │  ❌ Message Content ❌ Metadata     ❌ Communication Patterns │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    CAN PROCESS:                              │    │
│  │  ✅ Auth Tokens (anonymous)                                  │    │
│  │  ✅ Encrypted Derived Signals (opaque blobs)                 │    │
│  │  ✅ Professional Role Registry (no user data)                │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ML-KEM-768 Explanation

### What is ML-KEM-768?

ML-KEM-768 (Module-Lattice-Based Key-Encapsulation Mechanism) is a post-quantum cryptographic algorithm standardized by NIST in FIPS 203.

### Why Post-Quantum?

Current encryption (RSA, ECC) can be broken by future quantum computers using Shor's algorithm. Data encrypted today with standard algorithms could be decrypted in 10-15 years when quantum computers mature.

**"Harvest Now, Decrypt Later"** — Adversaries are already collecting encrypted data to decrypt later. Health data is a prime target.

### How Wellio Uses ML-KEM-768

| Use Case | Protection |
|----------|------------|
| Key Exchange | ML-KEM-768 establishes shared secrets |
| Medical Vault | ML-KEM-768 + AES-256-GCM |
| Secure Messaging | ML-KEM-768 key encapsulation |
| Data at Rest | AES-256-GCM with PQ key derivation |

### Security Level

ML-KEM-768 provides approximately 192-bit security against both classical and quantum attacks — equivalent to AES-192 security level.

---

## cMixx Explanation

### What is cMixx?

cMixx is a metadata-eliminating mix network developed by xx.network. It routes communications through multiple nodes in a way that eliminates patterns.

### The Metadata Problem

Even with end-to-end encryption, traditional systems leak:
- **Who** is communicating with whom
- **When** communications occur
- **How often** people communicate
- **Message sizes** and patterns

This metadata reveals relationships, behaviors, and health status.

### How cMixx Eliminates Metadata

```
Traditional Path:
User A ──────────────────────────────> User B
        (timing, size, frequency visible)

cMixx Path:
User A ──> Node 1 ──> Node 2 ──> Node 3 ──> User B
           (shuffled)  (batched)  (random timing)
```

**Key Techniques:**
- **Fixed-batch routing** — Messages batched together
- **Decentralized nodes** — No single point of observation
- **Random timing** — Eliminates timing correlation
- **Traffic analysis resistance** — Pattern-free communication

### What cMixx Protects

| Metadata Type | Standard E2E | Wellio + cMixx |
|---------------|--------------|----------------|
| Communication pairs | Visible | Hidden |
| Timing patterns | Visible | Hidden |
| Frequency | Visible | Hidden |
| Message sizes | Visible | Padded/Hidden |
| Network location | Visible | Anonymized |

---

## Data Boundaries Graphic

### Individual User Data (100% Private)

| Data Type | Storage | Access |
|-----------|---------|--------|
| Sleep Logs | Device Only | User Only |
| Meal Entries | Device Only | User Only |
| Hydration Records | Device Only | User Only |
| Activity Logs | Device Only | User Only |
| Mood Journals | Device Only | User Only |
| Medical Documents | Device + Encrypted | User Only |
| Personal Notes | Device Only | User Only |

### Derived Signals (Optional Sharing)

| Signal Type | Visible to User | Optional: Professional |
|-------------|-----------------|------------------------|
| FWI Score | ✅ | ✅ (if invited) |
| Trend Lines | ✅ | ✅ (if invited) |
| Adherence Flags | ✅ | ✅ (if invited) |
| Pattern Indicators | ✅ | ✅ (if invited) |

### Professional Visibility (Strictly Limited)

| Data Type | Trainer | Coach | Clinician |
|-----------|---------|-------|-----------|
| FWI Score | ✅ | ✅ | ✅ |
| Trends (14-30 day) | ✅ | ✅ | ✅ |
| Adherence Flags | ✅ | ✅ | ✅ |
| Raw Logs | ❌ | ❌ | ❌ |
| Journals | ❌ | ❌ | ❌ |
| Medical Vault | ❌ | ❌ | ❌ |
| Meal Notes | ❌ | ❌ | ❌ |
| Sleep Details | ❌ | ❌ | ❌ |

---

## Compliance Summary

### GDPR Alignment
- ✅ Data minimization (only derived signals shared)
- ✅ User control (explicit consent for professional access)
- ✅ Right to erasure (user controls all local data)
- ✅ Data portability (export capabilities)

### HIPAA Considerations
- ✅ No PHI transmission to servers
- ✅ Professionals receive derived signals only
- ✅ Reduced compliance burden for clinicians
- ✅ Clear data boundaries

### CCPA Compliance
- ✅ User data ownership
- ✅ Transparency about data handling
- ✅ Opt-out capabilities
- ✅ No data selling

---

## Security Badges for Marketing

### Badge 1: Post-Quantum Secured
**Visual:** Shield icon with "PQ" text
**Caption:** "Protected against future quantum threats"

### Badge 2: Metadata Eliminated
**Visual:** Lock with scattered nodes
**Caption:** "cMixx metadata protection"

### Badge 3: Zero-Trust Architecture
**Visual:** Device with shield
**Caption:** "Servers cannot access your data"

### Badge 4: On-Device Processing
**Visual:** Phone with lock inside
**Caption:** "Your data stays on your device"

### Badge 5: Encrypted Vault
**Visual:** Vault door with lock
**Caption:** "AES-256 + ML-KEM-768"

---

## FAQ for External Reviewers

### Q: Can Wellio servers read user data?
**A:** No. All raw data is encrypted on-device before any optional sync. Servers only see opaque ciphertext blobs they cannot decrypt.

### Q: What if servers are compromised?
**A:** Attackers would obtain only encrypted blobs with no way to decrypt them. User data remains protected.

### Q: How does professional access work?
**A:** Users generate invite codes. Professionals enter codes to receive access to derived signals only — never raw logs.

### Q: Is this HIPAA compliant?
**A:** Wellio specifically avoids transmitting PHI. Clinicians receive derived wellness signals, significantly reducing compliance exposure.

### Q: What happens if I lose my device?
**A:** Your vault is protected by PIN/biometric + encryption. Without authentication, data is inaccessible.

---

*Last updated: December 2024*
