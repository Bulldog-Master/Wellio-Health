# Wellio Health - Incident Response Runbook

## Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| P1 - Critical | Service down, data breach | 15 minutes | Auth broken, database inaccessible |
| P2 - High | Major feature broken | 1 hour | Payments failing, medical records inaccessible |
| P3 - Medium | Feature degraded | 4 hours | Slow performance, minor bugs |
| P4 - Low | Minor issues | 24 hours | UI glitches, non-critical features |

---

## Incident Response Process

### 1. Detection
- Error tracking alerts (when configured)
- User reports
- Monitoring alerts
- Anomaly detection triggers

### 2. Triage
1. Assess severity level
2. Identify affected users/features
3. Check error logs: `error_logs` table
4. Check security logs: `security_logs` table

### 3. Communication
- P1/P2: Immediate user notification if widespread
- Update status page (if applicable)
- Internal team notification

### 4. Resolution
1. Identify root cause
2. Implement fix
3. Deploy (frontend requires publish, backend auto-deploys)
4. Verify fix in production

### 5. Post-Mortem
- Document incident timeline
- Identify prevention measures
- Update runbook if needed

---

## Common Incidents

### Authentication Issues

**Symptoms**: Users can't log in, session errors

**Diagnosis**:
```sql
SELECT * FROM auth_logs 
WHERE timestamp > now() - interval '1 hour'
ORDER BY timestamp DESC LIMIT 50;
```

**Resolution**:
1. Check Lovable Cloud auth settings
2. Verify email provider connectivity
3. Check for rate limiting

---

### Database Connection Issues

**Symptoms**: Queries failing, timeout errors

**Diagnosis**:
```sql
SELECT * FROM postgres_logs 
WHERE timestamp > now() - interval '1 hour'
AND error_severity IN ('ERROR', 'FATAL')
ORDER BY timestamp DESC;
```

**Resolution**:
1. Check connection pool status
2. Review recent migrations
3. Contact Lovable support if persistent

---

### Edge Function Failures

**Symptoms**: API calls returning 500 errors

**Diagnosis**:
1. Check function logs in Cloud UI
2. Review recent deployments
3. Check secret configuration

**Resolution**:
1. Fix code errors
2. Redeploy function
3. Verify secrets are configured

---

### Payment Processing Issues

**Symptoms**: Checkout failures, payment not completing

**Diagnosis**:
```sql
SELECT * FROM payment_transactions 
WHERE status = 'failed' 
AND created_at > now() - interval '1 hour';
```

**Resolution**:
1. Check payment provider dashboard
2. Verify API keys are valid
3. Review error messages in transaction records

---

### Performance Degradation

**Symptoms**: Slow page loads, timeouts

**Diagnosis**:
1. Check Core Web Vitals in production
2. Review database query performance
3. Check bundle size

**Resolution**:
1. Optimize slow queries (add indexes)
2. Implement caching
3. Consider instance size upgrade

---

## Security Incidents

### Suspected Data Breach

1. **Immediate**: Disable affected accounts
2. **Investigate**: Review audit logs
3. **Contain**: Rotate compromised credentials
4. **Notify**: GDPR requires 72-hour notification
5. **Document**: Full incident report

### Suspicious Activity Detected

Check anomaly detection logs:
```sql
SELECT * FROM security_logs 
WHERE created_at > now() - interval '24 hours'
ORDER BY created_at DESC;
```

Actions:
1. Review flagged sessions
2. Force logout if needed
3. Require password reset

---

## Escalation Contacts

| Role | Contact | When to Escalate |
|------|---------|------------------|
| On-call Engineer | [TBD] | P1/P2 incidents |
| Product Owner | [TBD] | User-facing decisions |
| Legal/Compliance | [TBD] | Data breaches, GDPR |
| Lovable Support | support@lovable.dev | Infrastructure issues |

---

## Post-Incident Template

```markdown
## Incident Report: [Title]

**Date**: 
**Duration**: 
**Severity**: 
**Affected Users**: 

### Summary
[Brief description]

### Timeline
- HH:MM - Incident detected
- HH:MM - Investigation started
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

### Root Cause
[Technical explanation]

### Resolution
[What was done to fix]

### Prevention
[Steps to prevent recurrence]

### Action Items
- [ ] Item 1
- [ ] Item 2
```
