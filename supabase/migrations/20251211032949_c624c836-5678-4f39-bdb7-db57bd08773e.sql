-- Drop the existing constraint that's too broad
ALTER TABLE public.care_team_invites DROP CONSTRAINT IF EXISTS one_active_invite_per_role;

-- Create partial unique index for pending (non-accepted) invites only
-- Expiry check handled at application level
CREATE UNIQUE INDEX IF NOT EXISTS care_team_invites_unique_pending
ON public.care_team_invites (subject_id, role)
WHERE accepted_at IS NULL;