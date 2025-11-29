-- Add time_of_day column to activity_logs table
ALTER TABLE public.activity_logs 
ADD COLUMN time_of_day TEXT CHECK (time_of_day IN ('morning', 'afternoon', 'evening'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_time_of_day ON public.activity_logs(time_of_day);