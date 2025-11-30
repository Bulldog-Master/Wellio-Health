# Rate Limiting Guide

This document outlines the comprehensive rate limiting strategy implemented to protect sensitive operations from abuse and enhance application security.

## Overview

Rate limiting prevents:
- Brute force attacks (login, password reset)
- Spam and abuse (posts, comments, messages)
- API abuse (excessive follows, likes)
- DoS attacks (file uploads)
- Resource exhaustion

## Architecture

### Centralized Rate Limiter

**Location**: `src/lib/rateLimit.ts`

The `RateLimiter` class provides:
- In-memory tracking of attempts
- Configurable limits per operation
- Automatic blocking on violations
- Database logging of violations
- Automatic reset after time window

### Configuration

Each operation has specific limits:

```typescript
export const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
  },
  // ... more configs
};
```

## Implemented Rate Limits

### 1. Authentication Operations

#### Login Attempts
- **Limit**: 5 attempts per 15 minutes
- **Block**: 30 minutes after exceeding
- **Location**: `src/pages/Auth.tsx`
- **Purpose**: Prevent brute force attacks

```typescript
const rateLimit = await rateLimiter.check(
  `login:${email}`,
  RATE_LIMITS.LOGIN
);
```

#### Signup Attempts
- **Limit**: 3 attempts per hour
- **Block**: 24 hours after exceeding
- **Purpose**: Prevent fake account creation

#### Password Reset
- **Limit**: 3 attempts per hour
- **Block**: 2 hours after exceeding
- **Purpose**: Prevent email flooding

### 2. Social Operations

#### Follow/Unfollow Actions
- **Limit**: 30 actions per 5 minutes
- **Block**: 15 minutes after exceeding
- **Locations**: `src/pages/Search.tsx`, `src/pages/FollowersList.tsx`
- **Purpose**: Prevent follow spam

```typescript
const rateLimit = await rateLimiter.check(
  `follow:${userId}`,
  RATE_LIMITS.FOLLOW_ACTION
);
```

#### Post Creation
- **Limit**: 10 posts per 5 minutes
- **Location**: `src/pages/Feed.tsx`
- **Purpose**: Prevent spam posting

```typescript
const rateLimit = await rateLimiter.check(
  `post:${userId}`,
  RATE_LIMITS.POST_CREATE
);
```

#### Comment Creation
- **Limit**: 30 comments per 5 minutes
- **Location**: `src/pages/Feed.tsx`
- **Purpose**: Prevent comment spam

```typescript
const rateLimit = await rateLimiter.check(
  `comment:${userId}`,
  RATE_LIMITS.COMMENT_CREATE
);
```

#### Like Actions
- **Limit**: 100 likes per minute
- **Location**: `src/pages/Feed.tsx`
- **Purpose**: Prevent like botting while allowing normal usage

```typescript
const rateLimit = await rateLimiter.check(
  `like:${userId}`,
  RATE_LIMITS.LIKE_ACTION
);
```

### 3. Messaging Operations

#### Message Sending
- **Limit**: 60 messages per minute
- **Block**: 5 minutes after exceeding
- **Location**: `src/pages/Conversation.tsx`
- **Purpose**: Prevent message spam

```typescript
const rateLimit = await rateLimiter.check(
  `message:${userId}`,
  RATE_LIMITS.MESSAGE_SEND
);
```

### 4. Data Operations

#### File Uploads
- **Limit**: 20 uploads per 10 minutes
- **Location**: Integrated in post creation and medical uploads
- **Purpose**: Prevent storage abuse

```typescript
const rateLimit = await rateLimiter.check(
  `upload:${userId}`,
  RATE_LIMITS.FILE_UPLOAD
);
```

#### Profile Updates
- **Limit**: 5 updates per 10 minutes
- **Location**: `src/pages/Profile.tsx`
- **Purpose**: Prevent rapid profile changes

```typescript
const rateLimit = await rateLimiter.check(
  `profile:${userId}`,
  RATE_LIMITS.PROFILE_UPDATE
);
```

#### Medical File Access
- **Limit**: 50 accesses per 5 minutes
- **Purpose**: Monitor for unusual access patterns

```typescript
const rateLimit = await rateLimiter.check(
  `medical:${userId}`,
  RATE_LIMITS.MEDICAL_ACCESS
);
```

### 5. Financial Operations

#### Donations
- **Limit**: 5 donations per 10 minutes
- **Location**: `src/components/DonationModal.tsx`
- **Purpose**: Prevent fraudulent transactions

```typescript
const rateLimit = await rateLimiter.check(
  `donation:${userId}`,
  RATE_LIMITS.DONATION
);
```

#### Search Queries
- **Limit**: 50 queries per minute
- **Purpose**: Prevent search abuse

```typescript
const rateLimit = await rateLimiter.check(
  `search:${userId}`,
  RATE_LIMITS.SEARCH_QUERY
);
```

## Implementation Pattern

### Standard Usage

```typescript
import { rateLimiter, RATE_LIMITS } from "@/lib/rateLimit";

const handleAction = async () => {
  // 1. Check rate limit
  const rateLimitKey = `action:${userId}`;
  const rateLimit = await rateLimiter.check(
    rateLimitKey,
    RATE_LIMITS.ACTION_TYPE
  );

  // 2. Handle limit exceeded
  if (!rateLimit.allowed) {
    const minutesRemaining = Math.ceil(
      (rateLimit.resetAt.getTime() - Date.now()) / 60000
    );
    throw new Error(
      `Too many attempts. Please wait ${minutesRemaining} minutes.`
    );
  }

  // 3. Perform action
  await performAction();

  // 4. (Optional) Reset on success for critical operations
  rateLimiter.reset(rateLimitKey);
};
```

### With React Query Mutations

```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const rateLimit = await rateLimiter.check(
      `action:${userId}`,
      RATE_LIMITS.ACTION_TYPE
    );

    if (!rateLimit.allowed) {
      throw new Error("Rate limit exceeded");
    }

    return await api.performAction(data);
  },
  onError: (error: Error) => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  },
});
```

## Security Features

### 1. Violation Logging

All rate limit violations are logged to `security_logs` table:
- User ID
- Event type: `rate_limit_exceeded`
- Event data: Rate limit key
- Timestamp

### 2. Progressive Blocking

- First violations: Temporary block
- Repeated violations: Longer blocks
- Pattern tracking for abuse detection

### 3. Per-User Tracking

Rate limits tracked per user ID, preventing:
- Account sharing bypass
- Cross-account abuse
- IP-based circumvention

### 4. Memory Efficient

- In-memory Map for fast lookups
- Automatic cleanup of expired entries
- No database overhead for checks

## User Experience

### Clear Error Messages

```typescript
// Shows remaining time
"Too many attempts. Please wait 5 minutes."

// Shows seconds for short waits
"Creating posts too quickly. Please wait 30 seconds."
```

### Visual Feedback

```typescript
// Disable buttons during rate limit
<Button 
  disabled={isRateLimited}
  onClick={handleAction}
>
  {isRateLimited ? "Please wait..." : "Submit"}
</Button>
```

### Toast Notifications

All rate limit errors show user-friendly toast messages with:
- Clear explanation of what happened
- Time remaining until reset
- Destructive variant for visibility

## Monitoring & Analytics

### Security Logs Table

```sql
CREATE TABLE security_logs (
  id UUID PRIMARY KEY,
  user_id UUID,
  event_type TEXT,
  event_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Query Violations

```sql
-- Find users with most violations
SELECT user_id, COUNT(*) as violations
FROM security_logs
WHERE event_type = 'rate_limit_exceeded'
AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY user_id
ORDER BY violations DESC;

-- Find most violated endpoints
SELECT event_data->>'key' as endpoint, COUNT(*) as count
FROM security_logs
WHERE event_type = 'rate_limit_exceeded'
GROUP BY endpoint
ORDER BY count DESC;
```

## Configuration Guidelines

### Choosing Limits

Consider:
1. **Normal user behavior**: What's typical usage?
2. **Attack scenarios**: What would abuse look like?
3. **User experience**: Balance security with usability
4. **Resource costs**: API/database costs per operation

### Setting Time Windows

- **Short windows** (1-5 min): High-frequency actions (likes, searches)
- **Medium windows** (5-15 min): Moderate actions (posts, messages)
- **Long windows** (1-24 hours): Sensitive operations (auth, passwords)

### Block Durations

- **No block**: For non-critical operations
- **Short block** (5-15 min): Temporary cooldown
- **Long block** (30 min - 24 hours): Security-critical operations

## Testing

### Manual Testing

```typescript
// Test rate limit enforcement
for (let i = 0; i < 10; i++) {
  await performAction(); // Should fail after maxAttempts
}

// Test reset mechanism
rateLimiter.reset(key);
await performAction(); // Should succeed
```

### Unit Tests

```typescript
describe('Rate Limiter', () => {
  it('should allow actions within limit', async () => {
    const result = await rateLimiter.check('test:1', {
      maxAttempts: 3,
      windowMs: 60000,
    });
    expect(result.allowed).toBe(true);
  });

  it('should block after exceeding limit', async () => {
    // Exceed limit
    for (let i = 0; i < 4; i++) {
      await rateLimiter.check('test:2', {
        maxAttempts: 3,
        windowMs: 60000,
      });
    }
    
    const result = await rateLimiter.check('test:2', {
      maxAttempts: 3,
      windowMs: 60000,
    });
    expect(result.allowed).toBe(false);
  });
});
```

## Best Practices

### 1. Use Descriptive Keys

```typescript
// ✅ Good - clear and specific
`login:${email}`
`post:${userId}`
`upload:${userId}:${fileType}`

// ❌ Bad - ambiguous
`user:${userId}`
`action:1`
```

### 2. Reset on Success for Critical Operations

```typescript
// For login/auth, reset on successful attempt
if (loginSuccess) {
  rateLimiter.reset(`login:${email}`);
}
```

### 3. Different Limits for Different Operations

Don't use same limits for everything - tailor to each operation:
- Auth: Strict limits
- Social: Moderate limits
- Read-only: Generous limits

### 4. Combine with Other Security Measures

Rate limiting works best with:
- Input validation (Zod schemas)
- Authentication checks
- RLS policies
- Error handling

## Common Patterns

### Pattern 1: Mutation with Rate Limiting

```typescript
const mutation = useMutation({
  mutationFn: async (data) => {
    const rateLimit = await rateLimiter.check(key, config);
    if (!rateLimit.allowed) {
      throw new Error("Rate limit exceeded");
    }
    return await api.action(data);
  },
});
```

### Pattern 2: Multiple Operations

```typescript
// Check both post creation and file upload limits
const postLimit = await rateLimiter.check(`post:${userId}`, RATE_LIMITS.POST_CREATE);
const uploadLimit = await rateLimiter.check(`upload:${userId}`, RATE_LIMITS.FILE_UPLOAD);

if (!postLimit.allowed || !uploadLimit.allowed) {
  throw new Error("Rate limit exceeded");
}
```

### Pattern 3: Progressive Messaging

```typescript
if (!rateLimit.allowed) {
  const remaining = rateLimit.resetAt.getTime() - Date.now();
  
  if (remaining < 60000) {
    // Less than 1 minute
    throw new Error(`Wait ${Math.ceil(remaining / 1000)} seconds`);
  } else {
    // More than 1 minute
    throw new Error(`Wait ${Math.ceil(remaining / 60000)} minutes`);
  }
}
```

## Troubleshooting

### Issue: "Too many attempts" for normal usage

**Solution**: Adjust limits in `RATE_LIMITS` config
```typescript
// Increase maxAttempts or windowMs
SOME_ACTION: {
  maxAttempts: 50, // Increased from 30
  windowMs: 10 * 60 * 1000, // Increased window
}
```

### Issue: Rate limits not working

**Checklist**:
1. Is rate limiter imported?
2. Is check called before action?
3. Is error handled properly?
4. Check browser console for errors

### Issue: Users blocked indefinitely

**Solution**: Implement manual reset mechanism
```typescript
// Admin function to reset user rate limits
export async function resetUserRateLimits(userId: string) {
  const patterns = ['login', 'post', 'message', 'follow'];
  patterns.forEach(pattern => {
    rateLimiter.reset(`${pattern}:${userId}`);
  });
}
```

## Future Enhancements

1. **Distributed Rate Limiting**
   - Use Redis for multi-instance deployments
   - Share rate limit state across servers

2. **Adaptive Limits**
   - Adjust limits based on user reputation
   - Trusted users get higher limits

3. **IP-Based Tracking**
   - Track by IP for anonymous operations
   - Detect distributed attacks

4. **Rate Limit Headers**
   - Return `X-RateLimit-Remaining` header
   - Show countdown to users

5. **Whitelist/Blacklist**
   - Exempt certain users from limits
   - Immediately block known abusers

6. **Analytics Dashboard**
   - View rate limit violations in real-time
   - Track patterns and trends
   - Alert on suspicious activity

## Related Documentation

- [Input Validation Guide](./INPUT_VALIDATION.md)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Security Best Practices](./SECURITY.md)
- [Medical File Security](./MEDICAL_FILE_SECURITY.md)

## Resources

- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [Redis Rate Limiting](https://redis.io/docs/reference/patterns/distributed-locks/)
- [API Security Best Practices](https://owasp.org/www-project-api-security/)
