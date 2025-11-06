/*
  # Create files table for permanent storage

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
    - Add policy for public access (no auth required as per requirements)
*/

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE POLICY "Public access to files"
  ON files
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Push the changes to the database
supabase db push

psql -h your_host -U your_user -d your_db -f "c:\Users\ASUS\Desktop\practical-1\supabase\migrations\20250508105007_odd_base.sql"