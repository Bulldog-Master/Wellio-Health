-- Drop old problematic RLS policies that cause infinite recursion
-- These policies have recursive subqueries that reference their own tables

-- Drop old challenge_participants policies with recursive subqueries
DROP POLICY IF EXISTS "Users can view challenge participants if public or self" ON challenge_participants;
DROP POLICY IF EXISTS "Users can view participants of accessible challenges" ON challenge_participants;

-- Drop old custom_challenges policy with recursive subquery
DROP POLICY IF EXISTS "Users can view public challenges or challenges they created/joi" ON custom_challenges;

-- Drop old group_members policies with self-referential queries
DROP POLICY IF EXISTS "Group admins can manage members" ON group_members;
DROP POLICY IF EXISTS "Group members can view members" ON group_members;
DROP POLICY IF EXISTS "Users can view group membership" ON group_members;