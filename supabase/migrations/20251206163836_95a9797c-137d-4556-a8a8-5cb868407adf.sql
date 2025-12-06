-- Add signing_public_key column for ML-DSA signatures
ALTER TABLE public.user_encryption_keys 
ADD COLUMN IF NOT EXISTS signing_public_key TEXT;

-- Add key_type column to track encryption algorithm  
ALTER TABLE public.user_encryption_keys 
ADD COLUMN IF NOT EXISTS key_type TEXT DEFAULT 'ml_kem_768';

-- Add encryption_version column to track version
ALTER TABLE public.user_encryption_keys 
ADD COLUMN IF NOT EXISTS encryption_version INTEGER DEFAULT 3;

-- Add updated_at column for tracking key updates
ALTER TABLE public.user_encryption_keys 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add comment explaining quantum-resistant encryption
COMMENT ON TABLE public.user_encryption_keys IS 'Stores user public keys for quantum-resistant encryption (ML-KEM-768) and digital signatures (ML-DSA-65). Secret keys are stored client-side only.';

COMMENT ON COLUMN public.user_encryption_keys.public_key IS 'ML-KEM-768 public key for key encapsulation (FIPS 203)';
COMMENT ON COLUMN public.user_encryption_keys.signing_public_key IS 'ML-DSA-65 public key for digital signatures (FIPS 204)';
COMMENT ON COLUMN public.user_encryption_keys.key_type IS 'Key algorithm type: ml_kem_768, ml_kem_1024, etc.';
COMMENT ON COLUMN public.user_encryption_keys.encryption_version IS 'Encryption version: 1=legacy, 2=AES-256-GCM, 3=quantum-resistant';