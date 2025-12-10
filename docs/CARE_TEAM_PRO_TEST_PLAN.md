# Care Team + Pro Features Test Plan

**Smoke Test Checklist** - Verify all Care Team and Professional features in under 10 minutes.

---

## Pre-Test Setup (1 minute)

- [ ] **Three test accounts ready:**
  - Individual user account (free tier)
  - Coach/Trainer account (with professional role)
  - Clinician account (with professional role)

- [ ] **Test data:**
  - Individual has logged at least 3 days of data (workouts, meals, hydration, sleep)
  - At least one professional relationship exists (coach-client OR clinician-patient)

---

## Part 1: Individual User Flows (3 minutes)

### Today Screen
- [ ] Daily Score displays correctly (0-100)
- [ ] Action items list renders
- [ ] Streak counter shows correct count
- [ ] 7-day history chart displays
- [ ] Nudges appear (up to 3 messages)
- [ ] AI Insight bubble shows (if premium)

### Care Team Screen
- [ ] Navigate to Care Team from primary nav
- [ ] "Connections" section shows current relationships
- [ ] JoinByCode component visible if no connection
- [ ] "Who Can See My Data?" section explains visibility
- [ ] Revoke access button works (test with dummy)

### Join a Professional
- [ ] Enter valid invite code → pending status
- [ ] Accept relationship → active status
- [ ] Verify professional appears in Connections

---

## Part 2: Coach/Trainer Dashboard (3 minutes)

### Access
- [ ] Coach can log in and access Coach Portal
- [ ] Dashboard shows patient/client list
- [ ] Only approved relationships appear

### Patient Overview
- [ ] Each patient card shows:
  - [ ] Display name (anonymous ID fallback)
  - [ ] Latest FWI score
  - [ ] Trend indicator (↑/↓/→)
  - [ ] Last updated timestamp
  - [ ] Adherence flags (colored badges)

### Patient Detail View
- [ ] Click patient → detail view opens
- [ ] FWI breakdown visible (workout, hydration, mood, sleep)
- [ ] Adherence metrics display (percentages)
- [ ] 14-day trend chart renders
- [ ] Secure messaging available (E2E indicator)

### Invite Codes
- [ ] Generate new invite code
- [ ] Code displays correctly
- [ ] Old codes deactivated when new generated

---

## Part 3: Clinician Dashboard (2 minutes)

### Access
- [ ] Clinician can log in and access Clinician Portal
- [ ] Dashboard shows patient list
- [ ] Only approved relationships appear

### Patient Overview
- [ ] Same checks as Coach dashboard
- [ ] Verify clinician sees FWI, not raw logs

### Visibility Enforcement
- [ ] Clinician CANNOT see:
  - [ ] Raw meal notes
  - [ ] Raw workout logs
  - [ ] Medical documents
  - [ ] Message metadata

---

## Part 4: Pro Billing (1 minute)

### Upgrade Flow
- [ ] "Upgrade to Pro" button visible in dashboard
- [ ] Click → checkout session initiates
- [ ] Stripe Checkout page loads (test mode)
- [ ] Cancel returns to app

### Tier Verification
- [ ] After upgrade: `professional_subscriptions` table has entry
- [ ] `get_professional_tier()` returns correct tier
- [ ] Pro features unlock in UI

---

## Part 5: Security & Privacy (1 minute)

### RLS Verification
- [ ] Individual cannot access other users' daily_scores
- [ ] Coach can only access their clients' data
- [ ] Clinician can only access their patients' data

### Encryption
- [ ] Messages between professional and client show E2E indicator
- [ ] cMix status indicator shows (if enabled)

### Consent
- [ ] Relationship requires explicit user consent
- [ ] Consent string displayed before approval
- [ ] Revocation immediately removes access

---

## Quick Validation Queries

```sql
-- Check professional subscriptions
SELECT * FROM professional_subscriptions WHERE user_id = '[USER_ID]';

-- Check active coach relationships
SELECT * FROM coach_clients WHERE status = 'active' AND coach_id = '[COACH_ID]';

-- Check active clinician relationships
SELECT * FROM clinician_patients WHERE status = 'active' AND clinician_id = '[CLINICIAN_ID]';

-- Verify invite codes
SELECT * FROM professional_invite_codes WHERE professional_id = '[PRO_ID]' AND is_active = true;
```

---

## Pass/Fail Criteria

**PASS:** All checkboxes completed with no blockers
**PARTIAL:** Minor UI issues, core functionality works
**FAIL:** Any of:
- User cannot join professional via invite code
- Professional cannot see client FWI
- RLS allows unauthorized data access
- Billing flow fails to create session

---

## Post-Test Cleanup

1. Revoke test relationships
2. Cancel test subscriptions in Stripe dashboard
3. Clear test invite codes

---

*Last Updated: 2024-12-10*
*Estimated Time: 10 minutes*
