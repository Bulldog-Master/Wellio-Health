# Cryptographic Design Document

> Version: 1.0  
> Last Updated: 2025-01-10  
> Status: Design Phase

## Overview

This document defines the cryptographic architecture for secure messaging in the application, including key lifecycle, protocol versioning, and cMix integration points.

---

## 1. Key Types & Algorithms

### 1.1 Long-Term Identity Keypair (Post-Quantum)

| Property | Value |
|----------|-------|
| Algorithm | ML-KEM-768 (CRYSTALS-Kyber) |
| Purpose | Key encapsulation for establishing shared secrets |
| Storage | Device-only (IndexedDB with Web Crypto API wrapping) |
| Exportable | No (when possible) |

### 1.2 Signing Keypair (Post-Quantum)

| Property | Value |
|----------|-------|
| Algorithm | ML-DSA-65 (CRYSTALS-Dilithium) |
| Purpose | Message authentication, key verification |
| Storage | Device-only |

### 1.3 Session Keys

| Property | Value |
|----------|-------|
| Algorithm | AES-256-GCM |
| Derivation | HKDF-SHA-512 from KEM shared secret |
| Lifetime | Per-conversation, rotated on re-keying |

---

## 2. Key Storage Locations

### 2.1 Device Storage (Primary)

```
IndexedDB: wellio_crypto_keys
├── identity_keypair (encrypted with device key)
├── signing_keypair (encrypted with device key)
├── session_keys[] (per conversation)
└── key_metadata (creation date, last used)
```

**Encryption at rest**: Keys wrapped using Web Crypto API with a device-derived key (PBKDF2 from device fingerprint + optional user passphrase).

### 2.2 Cloud Backup (Optional)

| Field | Storage |
|-------|---------|
| Public keys | `user_encryption_keys` table (plaintext) |
| Private key backup blob | `user_key_backups` table (encrypted with user passphrase) |

**Backup encryption**: PBKDF2-SHA-512 (600k iterations) + AES-256-GCM

---

## 3. Key Lifecycle Events

### 3.1 New Device

1. User authenticates on new device
2. Option A: **Generate new keypair** (recommended)
   - Old messages on other devices remain readable there
   - New device cannot decrypt old messages (forward secrecy)
   - Peers notified of new public key
3. Option B: **Restore from backup**
   - User enters backup passphrase
   - Decrypt and import private key
   - Full message history accessible

### 3.2 Device Loss

1. User reports device lost via settings
2. System marks old device's keys as revoked
3. `key_revocations` table updated with device ID
4. Peers notified to stop using old public key
5. User generates new keypair on replacement device

### 3.3 Logout

| Action | Behavior |
|--------|----------|
| Soft logout | Session keys cleared, identity keypair retained (encrypted) |
| Hard logout | All key material cleared from device |
| Account deletion | All keys deleted, revocation broadcast to peers |

### 3.4 Key Rotation

- **Automatic**: Session keys rotated every 100 messages or 24 hours
- **Manual**: User can force re-key via settings
- **Triggered**: On suspected compromise, peer key change, or app update

---

## 4. Protocol Version Definition

### Protocol v1 (Current)

```yaml
version: 1
kem_algorithm: ML-KEM-768
signature_algorithm: ML-DSA-65
symmetric_algorithm: AES-256-GCM
kdf: HKDF-SHA-512
nonce_size: 12 bytes (96 bits)
tag_size: 16 bytes (128 bits)
```

### Message Format v1

```typescript
interface SecureMessageV1 {
  version: 1;
  sender_key_id: string;      // Hash of sender's public key
  recipient_key_id: string;   // Hash of recipient's public key
  kem_ciphertext: string;     // Base64-encoded KEM ciphertext
  nonce: string;              // Base64-encoded 12-byte nonce
  ciphertext: string;         // Base64-encoded AES-GCM ciphertext
  tag: string;                // Base64-encoded authentication tag
  timestamp_bucket: number;   // Rounded to nearest minute (metadata minimization)
}
```

### Version Coexistence

| Scenario | Behavior |
|----------|----------|
| Sender v1, Recipient v1 | Standard v1 flow |
| Sender v2, Recipient v1 | Sender falls back to v1 |
| Sender v1, Recipient v2 | Recipient decrypts v1, responds with v1 |
| Sender v2, Recipient v2 | Standard v2 flow |

Version negotiation happens via `user_encryption_keys.protocol_version` field.

---

## 5. Metadata Minimization

### 5.1 Timestamp Bucketing

- Timestamps rounded to nearest **minute** (60-second buckets)
- Stored as Unix timestamp in `secure_messages.timestamp_bucket`
- Reduces traffic analysis granularity

### 5.2 Forbidden Fields

The following MUST NOT appear in `secure_messages`:

- ❌ Message titles or subjects
- ❌ Tags or categories
- ❌ Read receipts (handled separately if needed)
- ❌ Typing indicators
- ❌ Device/platform identifiers

### 5.3 Conversation ID Handling

- `conversation_id` stored **inside ciphertext**, not as routing metadata
- External routing uses only `recipient_key_id` (hash, not full key)
- cMix layer adds additional anonymization

---

## 6. cMix Integration Design

### 6.1 Message Flow

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│   App       │───▶│  xxdk Client │───▶│   cMix      │───▶│    Peer      │
│  (encrypt)  │    │  (wrap)      │    │  (mixnet)   │    │  (decrypt)   │
└─────────────┘    └──────────────┘    └─────────────┘    └──────────────┘
```

### 6.2 Integration Points

| Component | Attachment Point |
|-----------|------------------|
| `SecureChatClient` | Replace `NoopTransport` with `CMixTransport` |
| Key exchange | Use cMix authenticated channels for initial KEM exchange |
| Message delivery | Route encrypted payloads through cMix mixnet |
| Delivery receipts | Fire-and-forget (no receipts through mixnet) |

### 6.3 cMix Message Wrapper

```typescript
interface CMixEnvelope {
  recipient_id: string;        // XX Network recipient ID
  encrypted_payload: string;   // Our SecureMessageV1, already encrypted
  round_id?: number;           // Optional: specific cMix round
}
```

### 6.4 Fallback Strategy

If cMix is unavailable:

1. Check `cmix_status` in app state
2. If disconnected > 30 seconds, fall back to direct Supabase delivery
3. UI shows "E2E only" indicator (no metadata protection)
4. Queue messages for cMix retry when reconnected

---

## 7. Database Schema (Relevant Tables)

### user_encryption_keys

```sql
CREATE TABLE user_encryption_keys (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  public_key TEXT NOT NULL,           -- ML-KEM-768 public key (Base64)
  signing_public_key TEXT,            -- ML-DSA-65 public key (Base64)
  key_id TEXT NOT NULL,               -- SHA-256 hash of public key
  protocol_version INTEGER DEFAULT 1,
  device_id TEXT,
  created_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  UNIQUE(user_id, device_id)
);
```

### secure_messages

```sql
CREATE TABLE secure_messages (
  id UUID PRIMARY KEY,
  sender_key_id TEXT NOT NULL,
  recipient_key_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  encrypted_payload TEXT NOT NULL,    -- Full SecureMessageV1 as JSON
  timestamp_bucket BIGINT,            -- Rounded timestamp
  created_at TIMESTAMPTZ,
  -- NO conversation_id here (inside ciphertext)
  -- NO read status, typing, etc.
);
```

### key_revocations

```sql
CREATE TABLE key_revocations (
  id UUID PRIMARY KEY,
  key_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users,
  reason TEXT,                        -- 'device_lost', 'rotation', 'compromise'
  revoked_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 8. Implementation Phases

### Phase 1: Real PQ Crypto (Current Focus)
- [ ] Replace `InsecureCrypto` with `@noble/post-quantum` implementation
- [ ] Implement key generation and storage in IndexedDB
- [ ] Add key backup/restore flow

### Phase 2: Protocol Hardening
- [ ] Implement timestamp bucketing
- [ ] Move conversation_id inside ciphertext
- [ ] Add key rotation logic

### Phase 3: cMix Integration
- [ ] Integrate xxdk-wasm client
- [ ] Implement `CMixTransport` replacing `NoopTransport`
- [ ] Add fallback to direct delivery
- [ ] UI indicators for privacy status

---

## 9. Security Considerations

### 9.1 Threat Model

| Threat | Mitigation |
|--------|------------|
| Server compromise | E2E encryption (server never sees plaintext) |
| Traffic analysis | cMix mixnet + timestamp bucketing |
| Key theft | Device-only storage, optional passphrase wrapping |
| Quantum attacks | ML-KEM-768, ML-DSA-65 (NIST PQC standards) |

### 9.2 Non-Goals

- This system is **not** an EMR/EHR
- We do **not** guarantee message delivery (fire-and-forget through cMix)
- We do **not** provide repudiation protection (messages are authenticated)

---

## 10. References

- [NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography)
- [XX Network cMix Protocol](https://xx.network/cMix/)
- [@noble/post-quantum library](https://github.com/paulmillr/noble-post-quantum)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
