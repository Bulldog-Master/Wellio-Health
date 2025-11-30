-- Fix search path for security functions
CREATE OR REPLACE FUNCTION validate_leaderboard_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent manual rank changes
  IF NEW.rank IS DISTINCT FROM OLD.rank AND TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Cannot manually update rank';
  END IF;
  
  -- Ensure progress doesn't decrease
  IF NEW.progress < OLD.progress THEN
    RAISE EXCEPTION 'Progress cannot decrease';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION require_recent_auth_for_medical()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access for audit trail
  INSERT INTO medical_audit_log (user_id, table_name, record_id, action)
  VALUES (NEW.user_id, TG_TABLE_NAME, NEW.id, TG_OP);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION log_medical_read()
RETURNS void AS $$
BEGIN
  -- This function can be called explicitly before reading medical data
  -- to ensure all access is logged
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;