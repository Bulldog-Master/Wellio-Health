-- Add score versioning and data coverage to daily_scores
ALTER TABLE public.daily_scores 
ADD COLUMN IF NOT EXISTS score_version integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS data_coverage numeric(3,2) DEFAULT NULL;

-- Add comment explaining the fields
COMMENT ON COLUMN public.daily_scores.score_version IS 'Version of scoring algorithm used (bump when weights/formula change)';
COMMENT ON COLUMN public.daily_scores.data_coverage IS 'Fraction of expected behaviors with data (0.0-1.0). NULL means not calculated.';

-- Add check constraint for data_coverage range
ALTER TABLE public.daily_scores 
ADD CONSTRAINT data_coverage_range CHECK (data_coverage IS NULL OR (data_coverage >= 0 AND data_coverage <= 1));