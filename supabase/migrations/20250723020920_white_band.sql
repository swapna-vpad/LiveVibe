/*
  # Create promoter profiles table

  1. New Tables
    - `promoter_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text, required)
      - `phone_number` (text, optional)
      - `city` (text, optional)
      - `state` (text, optional)
      - `country` (text, optional)
      - `number_of_clients` (integer, optional)
      - `profile_photo_url` (text, optional)
      - Social media fields (all optional)
      - `promoter_type` (text, required - promoter or curator)
      - `subscription_plan` (text, required)
      - `created_at` and `updated_at` timestamps

  2. Security
    - Enable RLS on `promoter_profiles` table
    - Add policies for authenticated users to manage their own data
    - Add policy for public read access
*/

CREATE TABLE IF NOT EXISTS promoter_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text,
  city text,
  state text,
  country text,
  number_of_clients integer DEFAULT 0,
  profile_photo_url text,
  instagram text,
  tiktok text,
  pinterest text,
  youtube text,
  behance text,
  facebook text,
  linkedin text,
  spotify text,
  promoter_type text NOT NULL CHECK (promoter_type IN ('promoter', 'curator')),
  subscription_plan text NOT NULL CHECK (subscription_plan IN ('freemium', 'vibe_pro', 'vibe_elite')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE promoter_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own promoter profile"
  ON promoter_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own promoter profile"
  ON promoter_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own promoter profile"
  ON promoter_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own promoter profile"
  ON promoter_profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public can read all promoter profiles
CREATE POLICY "Public can read all promoter profiles"
  ON promoter_profiles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_promoter_profiles_updated_at
  BEFORE UPDATE ON promoter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();