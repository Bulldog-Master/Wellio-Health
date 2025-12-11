# cMixx Integration Guide

## Overview

Wellio integrates with [xx.network's cMixx](https://xx.network) to provide **metadata protection** for professional messaging. This document explains why metadata protection matters, how it works, and how it integrates with Wellio's existing security architecture.

---

## Why Metadata Protection Matters

### The Problem with Standard E2E Encryption

Traditional end-to-end encryption (E2E) protects **message content** — an attacker cannot read what you wrote. However, E2E alone **does not protect metadata**:

| What E2E Protects | What E2E Leaks |
|-------------------|----------------|
| ✅ Message content | ❌ Who is communicating |
| ✅ Attachments | ❌ When messages are sent |
| ✅ Media files | ❌ Frequency of communication |
| | ❌ Message sizes and patterns |
| | ❌ Network timing correlations |

### Why This Matters for Wellness/Clinical Contexts

In health and wellness applications, metadata leakage can reveal:

- **Communication patterns** — How often a user contacts their clinician (potentially revealing health anxiety or crisis periods)
- **Timing correlations** — When users are active (sleep patterns, lifestyle indicators)
- **Relationship mapping** — Who is connected to which professionals (health concerns by specialist type)
- **Behavioral inference** — Frequent short messages after certain times might indicate mood patterns

Even if content is encrypted, adversaries (ISPs, network observers, compromised servers) can build detailed behavioral profiles from metadata alone.

---

## How cMixx Solves This

### Mixnet Architecture

cMixx is a **mixnet** (mix network) that anonymizes communication metadata through:

1. **Batched message routing** — Messages from many users are collected into fixed batches
2. **Multi-hop mixing** — Each message passes through multiple independent nodes
3. **Timing obfuscation** — Messages are delayed and reordered to break timing correlations
4. **Traffic analysis resistance** — Observers cannot determine who is talking to whom

### Key Technical Properties

| Property | Description |
|----------|-------------|
| **Fixed batch sizes** | All batches are identical size regardless of content |
| **Decentralized nodes** | No single server can reconstruct message flows |
| **Parallelized mixing** | Low-latency despite multi-hop routing |
| **Quantum resistance** | Uses post-quantum key encapsulation |

---

## Wellio Integration Architecture

### Layer Model

Wellio uses a **two-layer security model** for professional messaging:

```
┌─────────────────────────────────────────────────┐
│              Layer 2: cMixx                     │
│         (Metadata Protection)                   │
│   Hides: who, when, how often, patterns         │
└─────────────────────────────────────────────────┘
                      ▲
                      │
┌─────────────────────────────────────────────────┐
│              Layer 1: E2E Encryption            │
│         (Content Protection)                    │
│   Uses: ML-KEM-768 + AES-256-GCM               │
└─────────────────────────────────────────────────┘
```

### Interface Abstractions

Wellio uses two key interfaces (defined in `ACCESS_MODEL.md`) to abstract the transport and crypto layers:

```typescript
interface ISecureTransport {
  send(recipientId: string, payload: Uint8Array): Promise<void>;
  onReceive(handler: (senderId: string, payload: Uint8Array) => void): void;
}

interface ISecureCrypto {
  encryptForRecipient(recipientPublicKey: string, plaintext: Uint8Array): Promise<Uint8Array>;
  decryptFromSender(ciphertext: Uint8Array): Promise<Uint8Array>;
}
```

These abstractions allow swapping transport implementations (direct WebSocket, cMixx, future protocols) without changing application code.

### Message Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌─────────────┐
│   Wellio    │───▶│  E2E Layer   │───▶│ xxdk WASM   │───▶│   cMixx     │
│   Client    │    │  (encrypt)   │    │  (routing)  │    │   Network   │
└─────────────┘    └──────────────┘    └─────────────┘    └─────────────┘
                                                                │
┌─────────────┐    ┌──────────────┐    ┌─────────────┐          │
│  Recipient  │◀───│  E2E Layer   │◀───│ xxdk WASM   │◀─────────┘
│   Client    │    │  (decrypt)   │    │  (receive)  │
└─────────────┘    └──────────────┘    └─────────────┘
```

---

## Implementation Details

### Dependencies

```json
{
  "dependencies": {
    "xxdk-wasm": "^0.3.22"
  }
}
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `useE2EEncryption` | `src/hooks/encryption/` | E2E encryption hook |
| `useCmixConnection` | `src/hooks/network/` | cMixx network connection |
| `SecureMessaging` | `src/components/messages/` | UI for secure messaging |
| `user_encryption_keys` | Database table | Public key storage |
| `secure_messages` | Database table | Encrypted message storage |

### Database Schema

```sql
-- User encryption keys
CREATE TABLE user_encryption_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  public_key TEXT NOT NULL,
  key_type TEXT DEFAULT 'ml-kem-768',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Secure messages (stores only ciphertext)
CREATE TABLE secure_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES auth.users,
  ciphertext TEXT NOT NULL,
  nonce TEXT NOT NULL,
  kem_ciphertext TEXT,
  protocol_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Encryption Protocol

| Version | KEM | AEAD | KDF |
|---------|-----|------|-----|
| v1 | ML-KEM-768 | AES-256-GCM | HKDF-SHA3-256 |

---

## Failure Modes & Fallbacks

### Design Philosophy: Fail Closed

Wellio follows a **fail-closed** model for professional messaging. If cMixx is unavailable:

| Scenario | Behavior |
|----------|----------|
| cMixx network unreachable | Messages **not sent** — user notified |
| xxdk WASM fails to load | Messaging **disabled** — fallback UI shown |
| Key exchange failure | Conversation **not created** |

**Rationale**: Downgrading to plain WebSocket would expose metadata, which defeats the privacy promise. Users and professionals explicitly chose privacy-protected communication.

### Status Indicators

The UI displays connection status:

- 🟢 **Full Privacy** — cMixx connected, E2E active
- 🟡 **Partial Privacy** — E2E only (cMixx unavailable)
- 🔴 **No Privacy** — Connection failed (messaging disabled)

---

## For xx Foundation / Security Reviewers

### Verification Points

1. **xxdk-wasm dependency** — Listed in `package.json`
2. **ISecureTransport abstraction** — Documented in `ACCESS_MODEL.md`
3. **Fail-closed behavior** — No WebSocket fallback for professional messages
4. **Protocol versioning** — `protocol_version` column enables future migrations
5. **Key storage** — Public keys only; private keys device-stored

### Code Entry Points

```
src/hooks/network/useCmixConnection.ts      # cMixx connection management
src/hooks/encryption/useE2EEncryption.ts    # E2E encryption hook
src/lib/encryption.ts                        # Core encryption utilities
src/features/care-team/careTeamVisibility.ts # Visibility rules
```

### Related Documentation

- [ACCESS_MODEL.md](./ACCESS_MODEL.md) — Who sees what
- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) — Security posture assessment
- [PROFESSIONAL_ECONOMICS.md](./PROFESSIONAL_ECONOMICS.md) — Professional incentives

---

## Roadmap

### Current State (MVP)
- [x] E2E encryption (ML-KEM-768 + AES-256-GCM)
- [x] xxdk-wasm dependency
- [x] ISecureTransport/ISecureCrypto interfaces
- [x] Privacy status indicators

### Next Phase
- [ ] Full cMixx routing activation (awaiting xx network credentials)
- [ ] Offline message queuing
- [ ] Group messaging with cMixx

### Future
- [ ] Cross-platform key sync
- [ ] Hardware security key support
- [ ] Advanced traffic analysis resistance

---

## References

- [xx.network Documentation](https://xx.network/docs)
- [cMixx Whitepaper](https://xx.network/whitepaper)
- [@noble/post-quantum](https://github.com/paulmillr/noble-post-quantum) — ML-KEM implementation
- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
