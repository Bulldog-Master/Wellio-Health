-- Fix security warning: set search_path for update_medical_access_time function
CREATE OR REPLACE FUNCTION public.update_medical_access_time()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.last_accessed_at = now();
  RETURN NEW;
END;
$function$;