/*
  # Create files table with RLS

  1. New Tables
    - `files`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text)
      - `size` (bigint)
      - `data` (text)
      - `upload_date` (timestamptz)
      - `created_at` (timestamptz)
  2. Security
    - Enable RLS on `files` table
    - Add policy for public access to files
*/

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL,
  data text NOT NULL,
  upload_date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE files ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'files' 
    AND policyname = 'Public access to files'
  ) THEN
    CREATE POLICY "Public access to files"
      ON files
      FOR ALL
      TO public
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;