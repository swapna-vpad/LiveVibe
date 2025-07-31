/*
  # Create art pieces table

  1. New Tables
    - `art_pieces`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text, required)
      - `description` (text, optional)
      - `type` (text, required - image/audio/video/document)
      - `file_url` (text, required)
      - `file_name` (text, required)
      - `file_size` (integer, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `art_pieces` table
    - Add policies for authenticated users to manage their own art pieces
    - Add policy for public read access to art pieces

  3. Storage
    - Create storage bucket for art pieces
    - Set up proper access policies
*/

-- Create art_pieces table
CREATE TABLE IF NOT EXISTS art_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('image', 'audio', 'video', 'document')),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE art_pieces ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own art pieces"
  ON art_pieces
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read all art pieces"
  ON art_pieces
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own art pieces"
  ON art_pieces
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own art pieces"
  ON art_pieces
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own art pieces"
  ON art_pieces
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_art_pieces_updated_at
  BEFORE UPDATE ON art_pieces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for art pieces
INSERT INTO storage.buckets (id, name, public)
VALUES ('art-pieces', 'art-pieces', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload their own art pieces"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'art-pieces' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view all art pieces"
  ON storage.objects
  FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'art-pieces');

CREATE POLICY "Users can update their own art pieces"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'art-pieces' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own art pieces"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'art-pieces' AND auth.uid()::text = (storage.foldername(name))[1]);