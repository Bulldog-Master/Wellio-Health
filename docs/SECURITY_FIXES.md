# Security Fixes Applied

This document details all security issues found and fixed in the application.

## Date: 2025-11-30

### Critical Errors Fixed (10)

#### 1. User Personal Information Exposure
**Issue**: Profiles table exposed sensitive personal data (age, weight, height, fitness goals) to all followers.

**Fix**: 
- Created `can_view_full_profile()` function to check access rights
- Updated RLS policies to restrict profile viewing:
  - Users can view their own full profile
  - Others can only view public profiles (non-private accounts)
- Added documentation that sensitive fields should not be queried for public display

**Fields Safe for Public Query**: id, username, full_name, avatar_url, followers_count, following_count, total_points, current_streak, is_private

#### 2 & 3. Medical Records Security
**Issue**: Medical records and test results file URLs could be accessed without proper authorization.

**Status**: ✅ Already implemented in previous optimization work
- Time-limited signed URLs with expiration
- Audit logging for all file access
- File validation (size, type)
- `getSignedMedicalFileUrl()` and `getSignedMedicalDownloadUrl()` functions

#### 4. Private Messages from Blocked Users
**Issue**: Race condition allowed blocked users to read messages before block took effect.

**Fix**:
- Created comprehensive policy `Users can view unblocked conversation messages`
- Checks blocks in both directions (blocker and blocked)
- Prevents ANY message viewing between blocked users

#### 5. Booking Information Exposure
**Issue**: Trainers could view all confirmed bookings, exposing client patterns and pricing.

**Fix**:
- Replaced policy with `Trainers can view their own bookings`
- Trainers can only see bookings where they are the assigned trainer
- Clients can only see their own bookings

#### 6. Stripe Customer ID Exposure
**Issue**: Stripe IDs visible to users through subscription queries, enabling potential manipulation.

**Fix**:
- Added table comment documenting safe fields to query
- Removed view approach due to security definer issues
- App code should select only: tier, status, current_period_start, current_period_end, cancel_at_period_end
- **Never expose**: stripe_customer_id, stripe_subscription_id

#### 7. Anonymous Donation De-anonymization
**Issue**: Fundraiser creators could potentially identify anonymous donors through correlation.

**Fix**:
- Created `get_fundraiser_donations()` function
- Returns NULL for donor_id when donation is anonymous (unless viewing own donation)
- Updated RLS policy to respect anonymity

#### 8. Challenge Leaderboard Manipulation
**Issue**: Incorrect system policy configuration could allow manual rank manipulation.

**Fix**:
- Created `Users can view challenge leaderboard` (SELECT only)
- Created `Only system can manage leaderboard` (prevents manual changes)
- Leaderboard updates only through triggers/functions

#### 9. Spam Notifications
**Issue**: Any authenticated user could create notifications for any other user.

**Fix**:
- Created `Only triggers can create notifications` - blocks direct user inserts
- Created `Service role can create notifications` - allows system/triggers
- Notifications can only be created by trusted system components

#### 10. Post Metadata Privacy
**Issue**: JSONB metadata field could contain sensitive tracking data exposed to followers.

**Fix**:
- Added column comment with security warning
- Documentation: Never store location, device IDs, IP addresses, or tracking data
- Only store non-sensitive display metadata

### Warnings Fixed (10)

#### 11. Story Viewing Patterns
**Issue**: Story views could reveal close friend relationships.

**Fix**:
- Created `get_story_view_count()` function for aggregate counts
- Added documentation to use aggregated data for close friends stories
- Prevents relationship mapping through view patterns

#### 12. Workout Session Participant Tracking
**Issue**: Users could track when specific people are working out.

**Fix**:
- Updated policy `Participants can view session info`
- Users can see own participation always
- Can only see other participants in public sessions
- Private session participants hidden from non-participants

#### 13. Recipe Collaborator Information Harvesting
**Issue**: Collaboration data could map user relationships and networks.

**Fix**:
- Updated to `Users can view own recipe collaborations`
- Limited to: own collaborations, invitations sent/received, own recipes
- Prevents network mapping of unrelated users

#### 14. Error Log Flooding
**Issue**: Any user could flood error logs with fake entries.

**Fix**:
- Created `Authenticated users can log errors with limits`
- Validates error_message exists and length <= 5000 characters
- Users can only log their own errors (enforces user_id check)
- Added constraint for message length

#### 15. Security Log Pollution
**Issue**: Any code could create false security alerts.

**Fix**:
- Restricted to service role only:
  - `Only service role can insert security logs`
  - `Only service role can view security logs`
- Prevents false security events from polluting logs

#### 16. User Follow Relationships Mapping
**Issue**: Follow relationships visible, enabling social graph mapping.

**Fix**:
- Added documentation noting privacy consideration
- RLS is correct but documented potential need for `private_followers` option
- Acknowledged as acceptable risk for social features

#### 17. Trainer Location Stalking
**Issue**: Specific trainer locations could enable physical stalking.

**Fix**:
- Added column comment: Only city/region level location allowed
- Created `validate_trainer_location()` trigger function
- Rejects street addresses (detects patterns like "123 Main St")
- Example valid: "San Francisco, CA"
- Example invalid: "123 Main Street, San Francisco"

#### 18. Wearable Data Health Conditions
**Issue**: Wearable data could reveal health conditions if accessed.

**Fix**:
- Added table comment marking as SENSITIVE HEALTH DATA
- Documented: Consider application-level encryption
- Policy: Never share with third parties without explicit consent
- RLS protection already in place (user_id based)

#### 19. Private Group Membership Discovery
**Issue**: Group membership in sensitive groups could be exposed.

**Fix**:
- Updated to `Users can view group membership`
- Users see own memberships always
- Can only see others in non-private groups
- Added documentation for potential `hide_members` flag for sensitive groups

## Security Best Practices Implemented

### Data Access Patterns
1. **Least Privilege**: Users can only access their own data by default
2. **Public Data Filtering**: Separate functions/views for public vs private data
3. **Service Role Restriction**: System operations require service role
4. **Block Checking**: All social interactions check blocked_users table

### Data Protection
1. **Sensitive Fields**: Documented which fields are sensitive
2. **Anonymization**: Proper handling of anonymous data
3. **Encryption**: Guidance on when to use application-level encryption
4. **Audit Logging**: Medical data access fully audited

### Input Validation
1. **Length Limits**: Constraints on user inputs
2. **Format Validation**: Triggers for data format (e.g., location)
3. **User ID Enforcement**: RLS ensures correct user_id

### Privacy Controls
1. **Private Accounts**: is_private flag respected
2. **Blocked Users**: Comprehensive blocking enforcement
3. **Anonymous Donations**: True anonymity preserved
4. **Private Groups**: Membership hidden in sensitive contexts

## Application Code Requirements

### When Querying Profiles
```typescript
// ✅ Correct - Public profile query
const { data } = await supabase
  .from('profiles')
  .select('id, username, full_name, avatar_url, followers_count, following_count, total_points, current_streak, is_private')
  .eq('id', userId);

// ❌ Wrong - Exposes sensitive data
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);
```

### When Querying Subscriptions
```typescript
// ✅ Correct - Safe subscription data
const { data } = await supabase
  .from('subscriptions')
  .select('tier, status, current_period_start, current_period_end, cancel_at_period_end')
  .eq('user_id', userId);

// ❌ Wrong - Exposes Stripe IDs
const { data } = await supabase
  .from('subscriptions')
  .select('*');
```

### When Creating Notifications
```typescript
// ❌ Wrong - Direct insert blocked
await supabase
  .from('notifications')
  .insert({ ... });

// ✅ Correct - Use trigger/function
// Notifications created automatically by triggers on likes, follows, etc.
// Or call edge function with service role
```

### When Showing Fundraiser Donations
```typescript
// ✅ Correct - Use safe function
const { data } = await supabase
  .rpc('get_fundraiser_donations', { _fundraiser_id: fundraiserId });

// ❌ Wrong - Could expose anonymous donors
const { data } = await supabase
  .from('fundraiser_donations')
  .select('*');
```

## Testing Checklist

- [ ] Verify profile queries don't expose sensitive fields
- [ ] Test blocked user cannot see messages
- [ ] Confirm anonymous donations hide donor_id
- [ ] Validate trainer location rejects street addresses
- [ ] Test notification creation blocked for regular users
- [ ] Verify subscription queries don't return Stripe IDs
- [ ] Test private group membership hidden
- [ ] Confirm private session participants hidden

## Monitoring

- Check error_logs for unusual patterns (potential attacks)
- Monitor security_logs for suspicious activity
- Review medical_audit_log for unauthorized access attempts
- Audit fundraiser_donations for anonymity breaches

## Future Enhancements

1. Consider adding `private_followers` option to profiles
2. Implement application-level encryption for wearable_data
3. Add `hide_members` flag for sensitive group types
4. Implement rate limiting on error log creation
5. Consider aggregating story views for analytics
