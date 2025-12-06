-- Create audit logging function for sensitive data access
CREATE OR REPLACE FUNCTION public.log_sensitive_access()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.security_logs (user_id, event_type, event_data, severity)
  VALUES (
    auth.uid(),
    'sensitive_data_access',
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'record_id', COALESCE(NEW.id::text, OLD.id::text),
      'operation', TG_OP
    ),
    'high'
  );
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Audit access to wearable_connections (UPDATE/DELETE only)
DROP TRIGGER IF EXISTS audit_wearable_access ON public.wearable_connections;
CREATE TRIGGER audit_wearable_access
  AFTER UPDATE OR DELETE ON public.wearable_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_access();

-- Audit access to auth_secrets (UPDATE/DELETE only)
DROP TRIGGER IF EXISTS audit_auth_secrets_access ON public.auth_secrets;
CREATE TRIGGER audit_auth_secrets_access
  AFTER UPDATE OR DELETE ON public.auth_secrets
  FOR EACH ROW
  EXECUTE FUNCTION public.log_sensitive_access();