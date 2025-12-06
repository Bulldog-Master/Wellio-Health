-- Encrypt 2FA backup codes and add security columns

-- Add encrypted backup codes column to auth_secrets
ALTER TABLE public.auth_secrets 
ADD COLUMN IF NOT EXISTS backup_codes_encrypted TEXT,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 2;

-- Add encryption tracking to messages table for future E2E encryption
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS content_encrypted TEXT,
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT NULL;

-- Add comment explaining encryption versions
COMMENT ON COLUMN public.auth_secrets.encryption_version IS 'Encryption version: 1=legacy AES-GCM, 2=enhanced AES-256-GCM+PBKDF2, 3=quantum-resistant';
COMMENT ON COLUMN public.auth_secrets.backup_codes_encrypted IS 'Encrypted backup codes replacing plaintext backup_codes JSONB';
COMMENT ON COLUMN public.messages.encryption_version IS 'NULL=plaintext, 2+=encrypted content';

-- Add sanitization trigger for error_logs to prevent PII in context
CREATE OR REPLACE FUNCTION public.sanitize_error_log()
RETURNS TRIGGER AS $$
BEGIN
  -- Remove potentially sensitive fields from context
  IF NEW.context IS NOT NULL THEN
    NEW.context = NEW.context - 'password' - 'token' - 'secret' - 'api_key' - 'credit_card' - 'ssn';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS sanitize_error_log_trigger ON public.error_logs;
CREATE TRIGGER sanitize_error_log_trigger
  BEFORE INSERT ON public.error_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_error_log();

-- Add constraint to limit error log context size
ALTER TABLE public.error_logs 
ADD CONSTRAINT error_logs_context_size_check 
CHECK (octet_length(context::text) <= 5000);

-- Create index for efficient medical audit log queries
CREATE INDEX IF NOT EXISTS idx_medical_audit_log_accessed_at 
ON public.medical_audit_log(accessed_at DESC);

-- Add automatic cleanup function for old security logs (90 days retention)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.security_logs 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  DELETE FROM public.medical_audit_log 
  WHERE accessed_at < NOW() - INTERVAL '90 days';
  
  DELETE FROM public.error_logs 
  WHERE created_at < NOW() - INTERVAL '30 days' 
  AND resolved = true;
  
  DELETE FROM public.error_logs 
  WHERE created_at < NOW() - INTERVAL '90 days' 
  AND (severity = 'low' OR severity = 'medium');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add encryption version update function
CREATE OR REPLACE FUNCTION public.mark_encryption_upgraded(
  p_table_name TEXT,
  p_record_id UUID,
  p_new_version INTEGER DEFAULT 2
)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE public.%I SET encryption_version = $1 WHERE id = $2', p_table_name)
  USING p_new_version, p_record_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;