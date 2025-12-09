# Wellio Health - Backup & Recovery Procedures

## Database Backups

### Automatic Backups (Lovable Cloud)
Lovable Cloud automatically handles database backups:
- **Daily backups**: Retained for 7 days
- **Weekly backups**: Retained for 4 weeks
- **Point-in-time recovery**: Available within retention period

### Manual Data Export
Users can export their own data via Privacy Controls:
1. Navigate to Settings → Privacy & Security
2. Click "Export My Data"
3. Download JSON export within 24 hours

### Admin Data Export
For full database exports:
1. Use the Cloud UI → Database → Tables
2. Select table to export
3. Click export button for CSV download

---

## Recovery Procedures

### User Account Recovery
1. User initiates password reset via email
2. If 2FA enabled, backup codes can be used
3. Account deletion requests have 30-day grace period

### Data Corruption Recovery
1. Identify affected tables/records
2. Contact Lovable support for point-in-time recovery
3. Verify data integrity post-recovery

### Service Outage Recovery
1. Check Lovable status page
2. Edge functions auto-redeploy on fix
3. Database connections auto-reconnect

---

## Disaster Recovery Plan

### RTO (Recovery Time Objective): 4 hours
### RPO (Recovery Point Objective): 24 hours

### Scenarios

#### Scenario 1: Database Corruption
1. Identify corruption scope
2. Request point-in-time recovery from Lovable support
3. Verify data integrity
4. Notify affected users if needed

#### Scenario 2: Edge Function Failure
1. Check function logs for errors
2. Fix code and redeploy
3. Functions auto-deploy on code push

#### Scenario 3: Complete Service Outage
1. Monitor Lovable status page
2. Communicate with users via external channel
3. Service restoration handled by Lovable

---

## Data Retention Policies

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| User profiles | Until account deletion | 30-day grace period |
| Workout logs | Indefinite | User-owned data |
| Medical records | Indefinite | Encrypted, user-owned |
| Messages | Indefinite | E2E encrypted |
| Error logs (resolved) | 30 days | Auto-cleanup |
| Error logs (unresolved) | 90 days | Auto-cleanup |
| Security logs | 90 days | Compliance requirement |
| Audit logs | 90 days | Medical access tracking |

---

## Contact Information

- **Lovable Support**: Via in-app chat or support@lovable.dev
- **Emergency**: Document internal escalation contacts here
