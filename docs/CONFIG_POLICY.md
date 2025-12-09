# Configuration & Secrets Policy

> **Purpose**: Define clear boundaries between public configuration and private secrets to prevent accidental exposure.

## Overview

This project uses a tiered configuration approach:

| Tier | Location | Contents | Visibility |
|------|----------|----------|------------|
| **Public Config** | `.env` (tracked) | `VITE_*` publishable keys | ✅ Client-side, committed |
| **Private Secrets** | Lovable Cloud Secrets | API keys, encryption keys | ❌ Server-only, never committed |

---

## Public Configuration (`.env`)

### What Belongs Here
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Supabase anon key (designed for client exposure)
- `VITE_SUPABASE_PROJECT_ID` - Project identifier
- Feature flags (e.g., `VITE_ENABLE_ANALYTICS=true`)
- Public API endpoints

### Naming Convention
All public variables **MUST** use the `VITE_` prefix:
```bash
# ✅ Correct - exposed to client
VITE_PUBLIC_API_URL=https://api.example.com

# ❌ Wrong - will not be bundled
PUBLIC_API_URL=https://api.example.com
```

### Why It's Tracked
In Lovable Cloud projects, `.env` is auto-generated and committed by design. This is safe because:
1. Only contains publishable keys meant for client-side use
2. Supabase anon key is designed for browser exposure (protected by RLS)
3. No server-side secrets ever appear in this file

---

## Private Secrets (Lovable Cloud Secrets)

### What Belongs Here
- `SUPABASE_SERVICE_ROLE_KEY` - Admin database access
- `MEDICAL_ENCRYPTION_KEY` - Quantum-resistant encryption
- `OPENAI_API_KEY` - AI service credentials
- `STRIPE_SECRET_KEY` - Payment processing
- `PAYPAL_CLIENT_SECRET` - Payment processing
- OAuth client secrets
- Any key that grants privileged access

### How to Add Secrets
1. Use the Lovable Cloud Secrets UI
2. Or request via AI: "Add secret STRIPE_SECRET_KEY"
3. Secrets are encrypted at rest and only available to edge functions

### Access Pattern
```typescript
// Edge function - secrets available via Deno.env
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

// Client code - NEVER has access to secrets
// ❌ This will be undefined
const secret = import.meta.env.STRIPE_SECRET_KEY;
```

---

## Security Boundaries

### Edge Functions (Server-Side)
- ✅ Access to Lovable Cloud Secrets
- ✅ Can use service role key for admin operations
- ✅ Handles sensitive operations (encryption, payments, AI)

### Client Code (Browser)
- ✅ Access to `VITE_*` variables only
- ❌ No access to any secrets
- ❌ Cannot bypass RLS policies

---

## Decision Checklist

Before adding a new configuration value, ask:

| Question | If Yes | If No |
|----------|--------|-------|
| Does this grant privileged access? | → Lovable Cloud Secret | → `.env` |
| Could exposure cause harm? | → Lovable Cloud Secret | → `.env` |
| Is it designed for client-side? | → `.env` with `VITE_` | → Lovable Cloud Secret |
| Is it a feature flag? | → `.env` with `VITE_` | — |

---

## Current Secrets Inventory

### Configured in Lovable Cloud
- `SUPABASE_SERVICE_ROLE_KEY` - Database admin
- `MEDICAL_ENCRYPTION_KEY` - Medical data encryption (V3 quantum-resistant)

### Pending Configuration
- `STRIPE_SECRET_KEY` - Payment processing
- `PAYPAL_CLIENT_SECRET` - PayPal integration
- `OPENAI_API_KEY` - AI features (voice coaching, insights)
- `SUUNTO_API_KEY` - Wearable integration

---

## References

- [SECURITY_FAQ.md](./SECURITY_FAQ.md) - Security practices
- [Lovable Cloud Docs](https://docs.lovable.dev/features/cloud) - Secret management
- [Supabase Auth](https://supabase.com/docs/guides/auth) - Why anon key is safe
