# Wellio Access & Visibility Model

_Last updated: 2025-01-10_

## Master Positioning

**Wellio is a next-generation Wellness APP Platform that empowers individuals to track their wellbeing privately — while optionally connecting with trainers, coaches, or clinicians through secure, limited-visibility insights. It is privacy-first, post-quantum secure, and powered by cMixx metadata protection.**

## Security Statement

**The APP Platform is built with a zero-trust architecture. Raw logs never leave the user's device. All communication is protected with post-quantum encryption (ML-KEM-768) and cMixx metadata-elimination technology.**

---

This document defines **who can see what** inside the Wellio Wellness APP Platform and how access is granted, with explicit attention to:

- **Data minimization**
- **Metadata protection**
- **Post-quantum–resistant cryptography**
- Future routing via **xx.network's cMixx** mixnet

This is the canonical reference for product, engineering, and security decisions.

---

## 1. Roles

The APP Platform currently defines three primary roles:

- **Individual** – end user, owner of all personal data and derived scores.
- **Trainer/Coach** – performance professional focused on training, habits, and accountability.
- **Clinician** – licensed healthcare professional using the APP Platform for wellness trends and decision support (not diagnosis).

Future roles (physio, dietitian, org admin, etc.) SHOULD extend this model.

---

## 2. Data Surfaces

Wellio distinguishes between:

1. **Raw Data (High Sensitivity)**

   - Per-meal logs, notes, photos
   - Per-workout details, session notes
   - Journals, annotations, medical documents
   - Any text the user writes about their health

2. **Derived Data (Lower Sensitivity)**

   - Daily **Functional Wellness Index (FWI)** score (0–100)
   - Component adherence metrics (activity, meals, hydration, sleep, mood)
   - Trend lines (e.g., 14/30-day FWI trends)
   - Aggregated risk/adherence flags

By default, **professionals never see raw data**. They only see derived, functional indicators.

---

## 3. Visibility Matrix

### 3.1 Summary

| Role           | Functional Index | Trends & Flags | Adherence Breakdown | Raw Logs / Notes | Medical Docs | Secure Messaging       |
|----------------|------------------|----------------|---------------------|------------------|--------------|------------------------|
| Individual     | ✅ Full          | ✅ Full        | ✅ Full             | ✅ Full          | ✅ Full (if used) | ✅ Full               |
| Trainer/Coach  | ✅ Yes           | ✅ Yes         | ✅ Yes              | ❌ No (by default) | ❌ No        | ✅ Yes (E2EE, PQ+cMixx) |
| Clinician      | ✅ Yes           | ✅ Yes         | ✅ Yes              | ❌ No (by default) | ❌ No (by default) | ✅ Yes (E2EE, PQ+cMixx) |

**Key rule:**  
Coaches and clinicians see **functional signals**, not **raw diaries or PHI**.

### 3.2 Implementation Source of Truth

These rules are defined in code in:

```ts
src/features/care-team/careTeamVisibility.ts
```

Any change to visibility MUST update:

1. `CARE_TEAM_VISIBILITY_RULES` in that file, and
2. This ACCESS_MODEL.md document.

---

## 4. Relationship & Invite Code Model

### 4.1 Invite Codes

Professionals onboard clients via `professional_invite_codes`:

- Each professional has at most **one active invite code per role** (coach, clinician).
- Codes are random, non-guessable tokens (no PHI embedded).
- `current_uses` is incremented atomically via a Postgres function: `increment_invite_code_use(p_code_id uuid)`
- A helper function `set_active_invite_code` deactivates old codes and inserts a single new active one.

This ensures:

- Clean auditability ("How many people connected with this code?")
- No proliferation of stale invite codes

### 4.2 Relationship Creation

1. Individual enters a professional's invite code using `JoinByCode`.
2. Wellio looks up the code and determines the target professional + role.
3. A relationship request is created in `professional_relationship_requests` (or equivalent).
4. The professional can accept/decline the request.
5. Upon acceptance, an active row is created in:
   - `coach_clients` (for coach relationships), or
   - `clinician_patients` (for clinician relationships).

All professional access is derived from these tables under RLS.

### 4.3 Relationship Revocation

- Individuals can revoke access from the Care Team screen.
- Revocation MUST:
  - Prevent future reads of derived data by that professional.
  - Not retroactively alter local history (user device keeps its own data).
- Professionals may also revoke access to a client/patient (e.g., discharge).

---

## 5. Secure Messaging & Metadata Protection

### 5.1 Design Goals

1. End-to-end encryption of message contents.
2. Post-quantum–resistant key exchange (e.g., ML-KEM-768).
3. Metadata protection via xx.network's cMixx mixnet.
4. Server-side minimalism: store opaque ciphertext and minimal routing info.

### 5.2 Abstractions

Messaging is implemented via two interfaces:

- `ISecureTransport` – how encrypted bytes move (xxdk + cMixx)
- `ISecureCrypto` – how messages are encrypted/decrypted

These are wired into `SecureChatClient` and React hooks such as `useSecureChat`.

Plaintext is only available:

- On the user device
- On the professional's device
- Never in Supabase / backend logs

### 5.3 Server Storage

The `secure_messages` table stores:

- `id` (UUID)
- `conversation_id` (UUID)
- `sender_id` (UUID)
- `created_at` (timestamp)
- `ciphertext` (base64/hex)
- `nonce` (base64/hex)
- `kem_ciphertext` (optional, for bootstrap)
- `version` (protocol version)

It does **not** store:

- Plaintext content
- Derived summaries of content
- PHI or user identity beyond numeric IDs

### 5.4 Quantum-Resistance

Protocol v1 (proposed):

- **KEM**: ML-KEM-768 (Kyber-768 class)
- **AEAD**: AES-256-GCM or ChaCha20-Poly1305
- **KDF**: HKDF-SHA3-256

Protocol versions are recorded in `secure_messages.version` to allow future migration while preserving decryption.

---

## 6. RLS & Access Controls (High Level)

At a high level, RLS should enforce:

- **Individuals can see:**
  - Their own raw logs, vault, messages, FWI, trends.

- **Coaches can see:**
  - Derived data for clients in `coach_clients` with status `active`.
  - Secure messages in conversations where they are a participant.

- **Clinicians can see:**
  - Derived data for patients in `clinician_patients` with status `active`.
  - Secure messages in conversations where they are a participant.

They should **never**:

- Read rows representing another pro's relationships.
- Read raw logs or medical documents by default.
- Access messages for conversations they are not a party to.

---

## 7. Audit & Logging

Future work (recommended):

- A `data_access_log` table to record:
  - Who accessed which derived dataset (scores/trends)
  - When
  - For what role (coach/clinician)

This supports:

- User transparency ("Who has viewed my data?")
- Debugging and compliance inquiries

---

## 8. Changes & Governance

Any change to:

- Which roles exist
- What each role can see
- How invite codes work
- How messaging is encrypted or routed

**MUST**:

1. Update `src/features/care-team/careTeamVisibility.ts`
2. Update this `ACCESS_MODEL.md`
3. Update any relevant UX copy (Care Team screen, onboarding, privacy policy)

This ensures product, code, and legal language stay in sync.

---

## Related Documents

- **Professional Incentives & Monetization:**  
  [PROFESSIONAL_ECONOMICS.md](PROFESSIONAL_ECONOMICS.md)

- **Subscription Tiers for Pros:**  
  [SUBSCRIPTION_GUIDE.md](../SUBSCRIPTION_GUIDE.md)

- **High-Level Architecture:**  
  [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
