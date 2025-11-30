# Security Application Requirements

This document outlines security requirements that must be implemented at the **application code level**. Database-level protections (RLS policies, triggers, validation) are already in place, but the following require code changes.

## Critical: Profile Field Restrictions

### Issue
The `profiles` table RLS allows authenticated users to view non-private profiles, but the application must restrict which fields are queried to prevent data harvesting.

### Sensitive Fields (NEVER query for non-followers)
- `age`
- `weight`
- `weight_unit`
- `height`
- `height_unit`
- `goal`
- `fitness_level`
- `gender`
- `target_weight`
- `target_weight_unit`
- `exercise_goal`
- `move_goal`
- `stand_goal`

### Safe Public Fields
- `id`
- `username`
- `full_name`
- `avatar_url`
- `followers_count`
- `following_count`
- `total_points`
- `current_streak`
- `longest_streak`
- `is_private`

### Implementation Required

```typescript
// ✅ CORRECT - Public profile view
const { data: profile } = await supabase
  .from('profiles')
  .select(`
    id,
    username,
    full_name,
    avatar_url,
    followers_count,
    following_count,
    total_points,
    current_streak,
    longest_streak,
    is_private
  `)
  .eq('id', userId)
  .single();

// ✅ CORRECT - Full profile (own or following)
const { data: fullProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', auth.user.id) // Own profile
  .single();

// Or check if following first, then query full data
const { data: isFollowing } = await supabase
  .from('follows')
  .select('id')
  .eq('follower_id', auth.user.id)
  .eq('following_id', userId)
  .maybeSingle();

if (isFollowing || userId === auth.user.id) {
  // Query full profile
} else {
  // Query public fields only
}

// ❌ WRONG - Exposes all data
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

## Critical: Subscription Field Restrictions

### Issue
The `subscriptions` table contains Stripe IDs that must never be exposed to clients.

### Fields to NEVER Expose
- `stripe_customer_id`
- `stripe_subscription_id`

### Safe Fields
- `user_id`
- `tier`
- `status`
- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`
- `created_at`
- `updated_at`

### Implementation Required

```typescript
// ✅ CORRECT
const { data: subscription } = await supabase
  .from('subscriptions')
  .select(`
    user_id,
    tier,
    status,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    created_at,
    updated_at
  `)
  .eq('user_id', auth.user.id)
  .single();

// ❌ WRONG
const { data: subscription } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', auth.user.id)
  .single();
```

## Medical File URLs

### Issue
Medical record and test result file URLs must use signed URLs with expiration.

### Implementation Required

```typescript
// ✅ CORRECT - Use signed URL helper
import { getSignedMedicalFileUrl } from '@/lib/medicalFileStorage';

const signedUrl = await getSignedMedicalFileUrl(fileUrl, 3600); // 1 hour expiry

// ❌ WRONG - Direct file URL
<img src={record.file_url} />

// ✅ CORRECT
<img src={signedUrl} />
```

### Files Already Implementing This
- `src/lib/medicalFileStorage.ts` - Contains helper functions
- `src/pages/MedicalHistory.tsx` - Uses signed URLs
- Need to verify all medical file access uses these helpers

## Rate Limiting

### Implementation Status
✅ Rate limiting implemented in `src/lib/rateLimit.ts`

### Current Limits
- `FOLLOW_ACTION`: 10 per minute
- `MESSAGE_SEND`: 20 per minute
- `PROFILE_UPDATE`: 5 per minute
- `COMMENT_CREATE`: 15 per minute
- `LIKE_ACTION`: 30 per minute
- `SEARCH_QUERY`: 30 per minute

### Applied To
- ✅ Search page
- ✅ Followers list
- ✅ Conversation messages
- ✅ Feed comments/likes
- ✅ Profile updates

### Still Need Rate Limiting
- [ ] Post creation
- [ ] Story creation
- [ ] Group creation
- [ ] Challenge creation
- [ ] File uploads

## Input Validation

### Implementation Status
✅ Validation schemas in `src/lib/validationSchemas.ts`

### Need to Verify
- All form submissions use zod validation
- No direct database inserts without validation
- File uploads validate size and type
- URL parameters are sanitized

## Additional Security Measures

### 1. Medical Data Re-Authentication
Consider requiring step-up authentication (re-enter password or 2FA) when:
- Accessing medical records for first time in session
- Downloading medical files
- Updating medical information

### 2. Audit Logging
✅ Already implemented for medical data access in `medical_audit_log` table

### 3. Session Security
- Implement session timeout for sensitive operations
- Clear local storage on logout
- Invalidate sessions on password change

### 4. Content Security Policy (CSP)
Add CSP headers to prevent XSS attacks:
```typescript
// vite.config.ts or server config
headers: {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
}
```

### 5. Sensitive Data Encryption
For highly regulated environments, consider:
- Application-level encryption for wearable_data
- Encrypted storage for medication names
- Field-level encryption for symptom descriptions

## Testing Checklist

Application-level security testing required:

### Profile Data
- [ ] Verify public profile queries don't expose sensitive fields
- [ ] Test with different account types (public, private, following, not following)
- [ ] Confirm age/weight/health data not visible to strangers

### Subscription Data
- [ ] Verify Stripe IDs never appear in network responses
- [ ] Test subscription status display doesn't leak payment info
- [ ] Confirm only safe fields returned to client

### Medical Data
- [ ] All medical file URLs use signed URLs
- [ ] Signed URLs expire correctly
- [ ] Medical record access logged to audit table
- [ ] File downloads require authentication

### Rate Limiting
- [ ] Rate limits trigger correctly on rapid actions
- [ ] Error messages are user-friendly
- [ ] Limits reset after time period
- [ ] Bypass works for legitimate rapid actions

### Input Validation
- [ ] Forms reject invalid input
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] File uploads restricted by type/size

## Monitoring & Alerts

Set up monitoring for:

1. **Unusual Query Patterns**
   - Large batch profile queries (potential scraping)
   - Repeated medical record access (potential breach)
   - High-frequency API calls (potential attack)

2. **Failed Authentication**
   - Multiple failed 2FA attempts
   - Login attempts from unusual locations
   - Service role credential usage

3. **Data Export**
   - Large data exports
   - Medical record downloads
   - Subscription data queries

4. **Error Rates**
   - Spike in validation errors (potential attack)
   - Rate limit violations
   - Authorization failures

## Compliance Notes

### HIPAA Compliance
If handling U.S. healthcare data:
- ✅ Audit logging implemented
- ⚠️ Consider encryption at rest
- ⚠️ Consider encryption in transit beyond HTTPS
- ⚠️ Implement minimum necessary access
- ⚠️ Business associate agreements for Supabase

### GDPR Compliance
If handling EU user data:
- Implement data export functionality
- Implement data deletion (right to be forgotten)
- Add consent tracking
- Provide privacy policy
- Allow users to download their data

## Priority Action Items

1. **HIGH**: Audit all profile queries in codebase
2. **HIGH**: Verify subscription queries don't expose Stripe IDs
3. **MEDIUM**: Add rate limiting to post/story creation
4. **MEDIUM**: Implement CSP headers
5. **LOW**: Consider medical data re-authentication
6. **LOW**: Set up monitoring alerts
