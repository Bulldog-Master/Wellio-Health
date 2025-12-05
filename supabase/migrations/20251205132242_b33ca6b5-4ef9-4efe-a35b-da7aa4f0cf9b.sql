-- Drop legacy conflicting RLS policies on medical_records table
-- These policies bypass the session-based authentication because PostgreSQL combines SELECT policies with OR logic

DROP POLICY IF EXISTS "Owner only - view medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Owner only - insert medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Owner only - update medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Owner only - delete medical records" ON public.medical_records;

-- The session-based policies will now be the only active policies, enforcing re-authentication