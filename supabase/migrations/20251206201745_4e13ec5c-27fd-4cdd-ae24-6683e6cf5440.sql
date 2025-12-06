-- Security Enhancement: Remove plaintext email column from etransfer_requests
-- The encrypted version (reference_email_encrypted) should be used instead

-- First, ensure any existing plaintext emails are migrated (if not already)
-- This is a data cleanup - we keep encrypted version only

-- Drop the plaintext column to reduce PII surface area
ALTER TABLE public.etransfer_requests 
DROP COLUMN IF EXISTS reference_email;

-- Add comment documenting the security decision
COMMENT ON COLUMN public.etransfer_requests.reference_email_encrypted IS 
'Encrypted reference email using AES-256-GCM. Plaintext column removed Dec 2024 for security.';