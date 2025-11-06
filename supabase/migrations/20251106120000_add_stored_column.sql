-- Add `stored` column to files table so uploads can be pinned/stored until removed
ALTER TABLE files
  ADD COLUMN IF NOT EXISTS stored boolean DEFAULT true;
