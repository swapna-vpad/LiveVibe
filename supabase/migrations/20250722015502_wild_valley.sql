/*
  # Create artist profiles table

  1. New Tables
    - `artist_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text)
      - `phone_number` (text)
      - `city` (text)
      - `state` (text)
      - `country` (text)
      - `travel_distance` (integer, miles)
      - `profile_photo_url` (text)
      - `instagram` (text)
      - `tiktok` (text)
      - `pinterest` (text)
      - `youtube` (text)
      - `behance` (text)
      - `facebook` (text)
      - `linkedin` (text)
      - `artist_type` (text, 'visual', 'performing', 'both')
      - `visual_artist_category` (text)
      - `performing_artist_type` (text, 'singer', 'instrumentalist', 'both')
      - `music_genres` (text array)
      - `instruments` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `artist_profiles` table
    - Add policies for users to manage their own profiles
*/

CREATE TABLE IF NOT EXISTS artist_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone_number text,
  city text,
  state text,
  country text,
  travel_distance integer,
  profile_photo_url text,
  instagram text,
  tiktok text,
  pinterest text,
  youtube text,
  behance text,
  facebook text,
  linkedin text,
  artist_type text CHECK (artist_type IN ('visual', 'performing', 'both')),
  visual_artist_category text,
  performing_artist_type text CHECK (performing_artist_type IN ('singer', 'instrumentalist', 'both')),
  music_genres text[],
  instruments text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON artist_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON artist_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON artist_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
  ON artist_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public can read all profiles (for discovery)
CREATE POLICY "Public can read all profiles"
  ON artist_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_artist_profiles_updated_at
  BEFORE UPDATE ON artist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();