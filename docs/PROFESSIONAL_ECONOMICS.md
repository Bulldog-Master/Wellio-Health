# Professional Economics & Feature Roadmap

## Overview

This document maps the **professional economics model** for coaches and clinicians who use Wellio to serve their clients/patients. It specifies what professionals can do **now** (Core MVP), **next** (Phase 2 capabilities), and **later** (future integrations), ensuring monetization paths remain clear and aligned with privacy-first principles.

---

## Revenue Model Context

- Professionals pay for access to the platform (**Trainer Access** or **Practitioner Access** add-ons).
- They **can** charge their clients independently outside the platform (1:1 training, consultations, etc.).
- Future phases may enable in-app payments for services, but that's not MVP.

---

## Core MVP Features (Available Now)

| Feature               | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| Client list           | Professionals see a list of clients who have connected via invite code     |
| Functional index view | See aggregated wellness trends (not raw logs)                               |
| Secure notes (E2E)    | Write per-client notes, encrypted end-to-end                                |
| Invite code system    | Generate codes for clients to connect                                       |
| Revoke access         | Clients can revoke professional access anytime                              |

---

## Phase 2: Live Video Sessions

| Feature               | Description                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| Schedule sessions     | Create scheduled video sessions with clients                                |
| Session status        | Track session lifecycle: scheduled → in_session → completed/cancelled       |
| Meeting URL           | Store external meeting link (Zoom, Meet, etc.)                              |
| Session labels        | Tag sessions (check-in, program review, etc.)                               |

### Database: `video_sessions`

```sql
CREATE TABLE video_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid NOT NULL REFERENCES profiles(id),
  client_id uuid NOT NULL REFERENCES profiles(id),
  role text NOT NULL CHECK (role IN ('coach', 'clinician')),
  status text NOT NULL CHECK (status IN ('scheduled', 'in_session', 'completed', 'cancelled')),
  meeting_url text NOT NULL,
  label text,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

### RLS

- Professionals see only sessions where `professional_id = auth.uid()`
- Clients see only sessions where `client_id = auth.uid()`

---

## Phase 3: Professional Insights & Growth

| Feature                  | Description                                                              |
|--------------------------|--------------------------------------------------------------------------|
| Client count dashboard   | Total active clients, new connections this month                         |
| Session analytics        | Sessions completed this week/month, average duration                     |
| Revenue tracking*        | If in-app payments enabled, track earnings                               |
| Growth trends            | Client acquisition over time                                             |

*Revenue tracking requires payment integration (Stripe Connect or similar).

---

## Future Considerations

### In-App Payments
- Allow professionals to charge for sessions directly
- Platform takes a percentage (marketplace model)
- Requires Stripe Connect integration

### Certification Display
- Show verified certifications on professional profiles
- Badge system for credentials

### Client Reviews/Ratings
- Allow clients to rate professionals (optional, privacy-conscious)

### Group Sessions
- Enable multi-client video sessions
- Requires updated data model for participant lists

---

## Privacy Alignment

All professional features must align with Wellio's privacy-first principles:

1. **No PHI in metadata** — Session labels are generic, no diagnosis/treatment info
2. **Functional trends only** — Professionals see derived metrics, not raw health logs
3. **E2E for notes** — All professional notes are encrypted end-to-end
4. **cMix for messaging** — When secure chat is used, metadata is protected via xx.network mixnet
5. **User control** — Clients can revoke access at any time

---

## Implementation Status

| Feature                    | Status      | Notes                                    |
|----------------------------|-------------|------------------------------------------|
| Client list                | ✅ Complete | `coach_clients`, `clinician_patients`    |
| Functional index view      | ✅ Complete | `careTeamVisibility.ts`                  |
| Secure notes               | ✅ Complete | E2E encrypted                            |
| Invite code system         | ✅ Complete | `professional_invite_codes`              |
| Video sessions table       | ✅ Complete | `video_sessions` with RLS                |
| Video sessions hook        | ✅ Complete | `useVideoSessions`                       |
| Invite client dialog       | ✅ Complete | In Care Team UI                          |
| Revenue dashboard          | 🔜 Phase 3  | Placeholder added                        |
| In-app payments            | 📋 Future   | Requires Stripe Connect                  |

---

## Related Documentation

- [ACCESS_MODEL.md](./ACCESS_MODEL.md) — Detailed access control rules
- [CRYPTO_DESIGN.md](./CRYPTO_DESIGN.md) — Encryption architecture
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System overview
