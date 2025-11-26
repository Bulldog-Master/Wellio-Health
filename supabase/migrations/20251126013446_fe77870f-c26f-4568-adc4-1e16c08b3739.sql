-- Add repeat_count field to interval_timers table
ALTER TABLE interval_timers ADD COLUMN repeat_count integer DEFAULT 1;