# Medical File Security Guide

This document outlines the comprehensive security measures implemented for medical file storage and access in compliance with HIPAA and privacy best practices.

## Overview

Medical files (test results, medical records, prescriptions, etc.) require special security considerations due to their sensitive nature. This implementation uses **time-limited signed URLs** instead of permanent public URLs to ensure secure, auditable, and controlled access.

## Architecture

### 1. Signed URLs

**What are Signed URLs?**
- Temporary URLs that grant time-limited access to private files
- Automatically expire after a specified duration
- Cannot be reused after expiration
- Prevent unauthorized sharing of medical documents

**Implementation:**
```typescript
// Generate a signed URL with 1-hour expiry (default)
const signedUrl = await getSignedMedicalFileUrl(
  filePath,
  recordId,
  tableName
);

// Generate download URL with 5-minute expiry
const downloadUrl = await getSignedMedicalDownloadUrl(
  filePath,
  recordId,
  tableName
);
```

### 2. Audit Logging

**Why Audit Logging?**
- HIPAA compliance requirement
- Tracks who accessed what file and when
- Provides accountability and transparency
- Helps detect unauthorized access attempts

**Logged Events:**
- `VIEW` - File viewed in browser
- `DOWNLOAD` - File downloaded
- `UPLOAD` - New file uploaded
- `DELETE` - File deleted

**Data Captured:**
- User ID
- Timestamp
- Action type
- Record ID and table name
- User agent (browser/device info)
- IP address (optional, for enhanced security)

### 3. File Validation

**Pre-Upload Validation:**
```typescript
const validation = validateMedicalFile(file);
if (!validation.isValid) {
  // Show error: validation.error
}
```

**Validations Performed:**
- **File size**: Maximum 10MB
- **File type**: Only allowed types (PDF, images, Word docs)
- **Filename sanitization**: Prevents path traversal attacks

**Allowed File Types:**
- PDF documents (`.pdf`)
- Images (`.jpg`, `.jpeg`, `.png`, `.webp`)
- Word documents (`.doc`, `.docx`)

## Security Features

### 1. No Permanent URLs

❌ **Old Approach** (Insecure):
```typescript
// Public URL - anyone with link can access forever
const { data } = supabase.storage
  .from('medical-records')
  .getPublicUrl(filePath);
```

✅ **New Approach** (Secure):
```typescript
// Signed URL - expires in 1 hour, logged access
const signedUrl = await getSignedMedicalFileUrl(
  filePath,
  recordId,
  'medical_test_results'
);
```

### 2. Row Level Security (RLS)

Storage bucket has RLS policies that ensure:
- Users can only upload files to their own folder
- Users can only access their own files
- Files are organized by user ID: `{userId}/{category}/{timestamp}.ext`

### 3. Access Tracking

Every file access updates:
- `last_accessed_at` timestamp in database
- Audit log entry with full details
- User notification (via toast message)

### 4. Automatic Expiry

URLs automatically expire:
- **View URLs**: 1 hour (3600 seconds)
- **Download URLs**: 5 minutes (300 seconds)
- Expired URLs return 403 Forbidden error

## Implementation Details

### File Upload Flow

```typescript
// 1. Validate file
const validation = validateMedicalFile(file);
if (!validation.isValid) {
  toast.error(validation.error);
  return;
}

// 2. Upload with audit logging
const result = await uploadMedicalFile(
  file,
  userId,
  'medical_records'
);

if (!result.success) {
  toast.error(result.error);
  return;
}

// 3. Store file path in database (NOT public URL)
await supabase.from('medical_records').insert({
  user_id: userId,
  file_url: result.filePath, // Store path, not URL
  // ... other fields
});
```

### File Access Flow

```typescript
// 1. Request signed URL with audit logging
const signedUrl = await getSignedMedicalFileUrl(
  record.file_url,
  record.id,
  'medical_records'
);

// 2. Check if URL generation succeeded
if (!signedUrl) {
  toast.error('Failed to access file');
  return;
}

// 3. Notify user that access was logged
toast.success('File access has been recorded for audit purposes');

// 4. Open file in new tab
window.open(signedUrl, '_blank');
```

### Access History Retrieval

```typescript
// Get all access logs for a specific file
const history = await getMedicalFileAccessHistory(
  recordId,
  'medical_test_results'
);

// Display in UI
history.forEach(log => {
  console.log(`${log.action} by ${log.user_id} at ${log.accessed_at}`);
});
```

## Database Schema

### medical_audit_log Table

```sql
CREATE TABLE medical_audit_log (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  record_id TEXT NOT NULL,
  table_name TEXT NOT NULL,
  action TEXT NOT NULL,
  accessed_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Index for fast queries
CREATE INDEX idx_audit_user ON medical_audit_log(user_id);
CREATE INDEX idx_audit_record ON medical_audit_log(record_id, table_name);
CREATE INDEX idx_audit_time ON medical_audit_log(accessed_at DESC);
```

### last_accessed_at Fields

```sql
ALTER TABLE medical_test_results 
ADD COLUMN last_accessed_at TIMESTAMP;

ALTER TABLE medical_records 
ADD COLUMN last_accessed_at TIMESTAMP;
```

## Compliance & Best Practices

### HIPAA Compliance

✅ **Implemented:**
- Audit logging of all file access
- Time-limited access URLs
- Encryption in transit (HTTPS)
- Access controls (RLS policies)
- User authentication required

⚠️ **Additional Considerations:**
- Encryption at rest (handled by Supabase/storage provider)
- Business Associate Agreement with Supabase
- Regular security audits
- Data retention policies
- Breach notification procedures

### Privacy Best Practices

1. **Minimal Data Exposure**
   - Files stored with non-descriptive filenames
   - No PHI in filenames or metadata
   - Organized by user ID, not by name

2. **Access Logging**
   - All access attempts logged
   - Failed access attempts captured
   - Regular review of access logs

3. **Secure Deletion**
   - Files removed from storage immediately
   - Audit log entry created for deletion
   - No soft-delete with public access

4. **User Notifications**
   - Users informed when files are accessed
   - Toast messages provide transparency
   - Users can review access history (future feature)

## Error Handling

### Upload Errors

```typescript
// Validation errors
if (file.size > 10MB) {
  return "File size must be less than 10MB";
}

if (!ALLOWED_TYPES.includes(file.type)) {
  return "File type not allowed. Please upload PDF, JPEG, PNG, or Word documents.";
}

// Upload errors
if (storageError) {
  return "Failed to upload file. Please try again.";
}
```

### Access Errors

```typescript
// Expired URL
if (!signedUrl) {
  toast.error("Failed to access file. The link may have expired.");
}

// Unauthorized access
if (error.code === '403') {
  toast.error("You don't have permission to access this file.");
}

// Network errors
if (error.code === 'NETWORK_ERROR') {
  toast.error("Network error. Please check your connection and try again.");
}
```

## Testing Checklist

### Security Testing

- [ ] Verify signed URLs expire after set time
- [ ] Confirm expired URLs return 403 error
- [ ] Test that users can only access their own files
- [ ] Verify RLS policies prevent cross-user access
- [ ] Check audit logs are created for all actions

### Functional Testing

- [ ] Upload various file types (PDF, images, docs)
- [ ] Upload files at size limits (9MB, 10MB, 11MB)
- [ ] View files in browser
- [ ] Download files
- [ ] Delete files
- [ ] Verify error messages are user-friendly

### Compliance Testing

- [ ] Audit logs contain all required information
- [ ] Access timestamps are accurate
- [ ] User agent information is captured
- [ ] File access can be traced to specific users
- [ ] Deleted files no longer accessible

## Future Enhancements

### Planned Features

1. **User Access History Dashboard**
   - Show users their file access history
   - Display who accessed what files when
   - Allow export of access logs

2. **Advanced File Validation**
   - Virus scanning on upload
   - Content validation (ensure PDFs are valid)
   - Image optimization for faster loading

3. **Enhanced Audit Trail**
   - IP address logging
   - Geolocation tracking
   - Failed access attempt detection
   - Anomaly detection (unusual access patterns)

4. **Automatic URL Refresh**
   - Background refresh of expiring URLs
   - Seamless experience for long viewing sessions
   - Warning before URL expires

5. **File Sharing**
   - Time-limited sharing with specific users
   - Password-protected file sharing
   - Audit logging of shared access

6. **Encryption Enhancements**
   - Client-side encryption before upload
   - End-to-end encryption for maximum security
   - User-controlled encryption keys

## Troubleshooting

### Common Issues

**Issue**: "Failed to access file"
- **Cause**: URL expired (1 hour timeout)
- **Solution**: Close and reopen the file to generate new signed URL

**Issue**: "Failed to upload file"
- **Cause**: File too large or wrong type
- **Solution**: Check file size (<10MB) and type (PDF, images, docs)

**Issue**: "File not found"
- **Cause**: File deleted or path incorrect
- **Solution**: Check database for correct file_url value

**Issue**: Audit logs not being created
- **Cause**: Permission issues or database error
- **Solution**: Check RLS policies on medical_audit_log table

### Debug Mode

Enable debug logging:
```typescript
// In medicalFileStorage.ts
const DEBUG = import.meta.env.DEV;

if (DEBUG) {
  console.log('File upload result:', result);
  console.log('Signed URL generated:', signedUrl);
  console.log('Audit log created:', auditEntry);
}
```

## Related Documentation

- [Input Validation Guide](./INPUT_VALIDATION.md)
- [Error Handling Guide](./ERROR_HANDLING.md)
- [Database Security](./DATABASE_SECURITY.md)
- [HIPAA Compliance Checklist](./HIPAA_COMPLIANCE.md)

## Resources

- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/index.html)
- [Supabase Storage Security](https://supabase.com/docs/guides/storage/security/access-control)
- [Signed URLs Best Practices](https://cloud.google.com/storage/docs/access-control/signed-urls)
- [Medical Data Privacy Guidelines](https://www.hhs.gov/hipaa/for-professionals/privacy/index.html)
