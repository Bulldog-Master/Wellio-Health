-- Enable RLS on data_access_log
ALTER TABLE public.data_access_log ENABLE ROW LEVEL SECURITY;

-- 1. Subject can read rows where they are the subject (client_id is the subject)
CREATE POLICY "Individuals can view their own access log"
ON public.data_access_log
FOR SELECT
USING (auth.uid() = client_id);

-- 2. Viewer can read their own access activity (professional_id is the viewer)
CREATE POLICY "Professionals can view their own access actions"
ON public.data_access_log
FOR SELECT
USING (auth.uid() = professional_id);

-- 3. Inserts only via service role / edge function (block direct client inserts)
CREATE POLICY "No direct inserts from clients"
ON public.data_access_log
FOR INSERT
WITH CHECK (false);