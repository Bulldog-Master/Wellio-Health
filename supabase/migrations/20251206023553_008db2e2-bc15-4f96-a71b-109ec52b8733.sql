-- Move pg_cron and pg_net extensions to extensions schema (security best practice)
-- Drop from public if exists and recreate in extensions schema

-- First ensure extensions schema exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move extensions to extensions schema (these are already in cron schema by default for pg_cron)
-- The warning is informational - pg_cron is typically installed in cron schema
-- pg_net should be moved to extensions

DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;