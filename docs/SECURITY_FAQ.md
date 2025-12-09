# Security FAQ

Common security questions and clarifications for external code reviewers.

---

## Q: Is the `.env` file a security risk?

**No.** The `.env` file in this repository contains only **publishable keys** that are designed for client-side exposure:

| Variable | Purpose | Security Level |
|----------|---------|----------------|
| `VITE_SUPABASE_URL` | Public API endpoint | **Public** - Required for client requests |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anonymous/public key | **Public** - Designed for browsers |
| `VITE_SUPABASE_PROJECT_ID` | Project identifier | **Public** - Not a secret |

### Why This Is Safe

1. **Supabase Architecture**: Supabase uses a client-side SDK that requires the URL and anon key to be in browser code. These are not secrets.

2. **Row Level Security (RLS)**: All data access is controlled by RLS policies in the database, not by keeping keys secret. Even with these keys, unauthorized access is blocked by RLS.

3. **Real Secrets Are Elsewhere**: Actual secrets (API keys, service role keys, encryption keys) are stored in **Lovable Cloud Secrets** and only accessible to Edge Functions server-side.

### What Would Be a Security Risk

- ❌ `SUPABASE_SERVICE_ROLE_KEY` - Never in client code (we don't have this in .env)
- ❌ `OPENAI_API_KEY` - Stored in Lovable Cloud Secrets
- ❌ `STRIPE_SECRET_KEY` - Stored in Lovable Cloud Secrets
- ❌ `MEDICAL_ENCRYPTION_KEY` - Stored in Lovable Cloud Secrets

---

## Q: Why not add `.env` to `.gitignore`?

This project uses **Lovable Cloud**, which auto-generates and manages the `.env` file. The file is intentionally committed because:

1. It contains only publishable keys
2. It ensures consistent development environment setup
3. It's required for the Lovable platform integration

---

## Q: How are secrets managed?

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  .env (publishable keys only)                       │    │
│  │  - VITE_SUPABASE_URL                                │    │
│  │  - VITE_SUPABASE_PUBLISHABLE_KEY                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Edge Functions)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Lovable Cloud Secrets (never exposed)              │    │
│  │  - SUPABASE_SERVICE_ROLE_KEY                        │    │
│  │  - OPENAI_API_KEY                                   │    │
│  │  - STRIPE_SECRET_KEY                                │    │
│  │  - MEDICAL_ENCRYPTION_KEY                           │    │
│  │  - LOVABLE_API_KEY                                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Q: What protects the database?

### Row Level Security (RLS)

Every table has RLS policies that enforce access control at the database level:

```sql
-- Example: Users can only read their own data
CREATE POLICY "Users can view own data" ON nutrition_logs
  FOR SELECT USING (auth.uid() = user_id);
```

### Encryption

| Data Type | Encryption Level | Algorithm |
|-----------|------------------|-----------|
| Medical records | V3 (Quantum-resistant) | ML-KEM-768 + AES-256-GCM |
| Messages/PII | V2 (Enhanced) | AES-256-GCM + PBKDF2 |
| General data | V1 (Standard) | RLS + standard encryption |

### Security Functions

```sql
-- Role-based access control
SELECT has_role(auth.uid(), 'admin');

-- VIP access verification
SELECT has_active_vip(auth.uid());

-- Safe profile retrieval (prevents data leakage)
SELECT * FROM get_profile_safe(user_id);
```

---

## Q: How is medical data protected?

Medical data receives the highest security treatment:

1. **Quantum-Resistant Encryption**: Uses NIST post-quantum standards (CRYSTALS-Kyber)
2. **Re-authentication Required**: Users must re-verify identity to access medical records
3. **Audit Logging**: All medical data access is logged to `medical_audit_log`
4. **HIPAA Compliance**: Authorization tracking and data handling follows HIPAA guidelines
5. **Separate Storage**: Medical files use a private storage bucket with strict policies

---

## Q: Is the app HIPAA/GDPR compliant?

The app is **designed to align with** HIPAA, GDPR, CCPA, and PIPEDA requirements:

- ✅ Encryption at rest and in transit
- ✅ Audit logging for sensitive data
- ✅ User consent management
- ✅ Data export capability
- ✅ Account deletion requests
- ✅ Privacy controls UI

**Disclaimer**: Formal compliance certification requires legal/regulatory review. See the regulatory disclaimer in README.md.

---

## Q: What about API rate limiting?

Rate limiting is implemented at multiple levels:

1. **Client-side**: `src/lib/rateLimit.ts` - Prevents abuse
2. **Edge Functions**: Request validation and JWT verification
3. **Supabase**: Built-in rate limiting on API endpoints

---

## Q: How are Edge Functions secured?

All Edge Functions follow this pattern:

```typescript
// 1. Extract JWT from Authorization header
const authHeader = req.headers.get('Authorization');
const token = authHeader?.replace('Bearer ', '');

// 2. Validate user with admin client
const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
if (error || !user) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
}

// 3. Use service role for mutations (bypasses RLS safely)
const { data, error: insertError } = await supabaseAdmin
  .from('table')
  .insert({ user_id: user.id, ... });
```

---

## Q: CSP and Security Headers?

Content Security Policy and security headers are configured in `index.html`:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ai.gateway.lovable.dev;
  frame-src 'self' https://www.youtube.com;
  object-src 'none';
  base-uri 'self';
  frame-ancestors 'self';
  upgrade-insecure-requests;
" />
<meta http-equiv="X-Content-Type-Options" content="nosniff" />
<meta http-equiv="X-Frame-Options" content="SAMEORIGIN" />
<meta http-equiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
```

---

## Related Documentation

- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Full security audit results
- [AI_PRIVACY.md](./AI_PRIVACY.md) - AI data handling policies
- [DOMAIN_ARCHITECTURE.md](./DOMAIN_ARCHITECTURE.md) - Domain security levels
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview

---

*Last updated: 2025-01*
