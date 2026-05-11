-- Migration: Change experience column from INTEGER to DECIMAL(5,1)
-- Reason: CSV data contains decimal years (e.g. 1.5, 2.5, 5.8) which
-- were rejected by Postgres with "invalid input syntax for type integer"

ALTER TABLE candidates ALTER COLUMN experience TYPE DECIMAL(5,1) USING experience::DECIMAL(5,1);

COMMENT ON COLUMN candidates.experience IS 'Years of experience (decimal supported e.g. 1.5, 5.8)';
