-- Drop legacy conflicting RLS policies on medical_test_results table
-- These policies bypass the session-based authentication because PostgreSQL combines SELECT policies with OR logic

DROP POLICY IF EXISTS "Owner only - view test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Owner only - insert test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Owner only - update test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Owner only - delete test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Users can view own medical test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Users can insert own medical test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Users can update own medical test results" ON public.medical_test_results;
DROP POLICY IF EXISTS "Users can delete own medical test results" ON public.medical_test_results;

-- The session-based policies will now be the only active policies, enforcing re-authentication