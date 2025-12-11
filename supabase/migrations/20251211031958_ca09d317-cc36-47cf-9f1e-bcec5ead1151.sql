-- Add missing columns to data_access_log table
ALTER TABLE public.data_access_log 
ADD COLUMN IF NOT EXISTS role text,
ADD COLUMN IF NOT EXISTS context jsonb DEFAULT '{}'::jsonb;

-- Add check constraint for role
ALTER TABLE public.data_access_log
DROP CONSTRAINT IF EXISTS data_access_log_role_check;

ALTER TABLE public.data_access_log
ADD CONSTRAINT data_access_log_role_check 
CHECK (role IS NULL OR role IN ('supporter', 'coach', 'clinician'));

-- Add check constraint for access_type
ALTER TABLE public.data_access_log
DROP CONSTRAINT IF EXISTS data_access_log_access_type_check;

ALTER TABLE public.data_access_log
ADD CONSTRAINT data_access_log_access_type_check 
CHECK (access_type IN ('fwi', 'trends', 'adherence', 'summary', 'messaging_metadata_free_view', 'profile_view', 'dashboard_view'));

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_data_access_log_client_id ON public.data_access_log(client_id);
CREATE INDEX IF NOT EXISTS idx_data_access_log_professional_id ON public.data_access_log(professional_id);
CREATE INDEX IF NOT EXISTS idx_data_access_log_accessed_at ON public.data_access_log(accessed_at DESC);