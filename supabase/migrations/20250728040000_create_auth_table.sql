/*
  # Create auth_table for storing user authentication details with user type

  1. New Table
    - `auth_table`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `user_type` (text, 'artist' or 'promoter')
      - `email` (text, from auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `auth_table`
    - Add policies for users to read their own auth data
    - Add policies for system to insert auth data
*/

CREATE TABLE IF NOT EXISTS auth_table (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('artist', 'promoter')),
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE auth_table ENABLE ROW LEVEL SECURITY;

-- Users can read their own auth data
CREATE POLICY "Users can read own auth data"
  ON auth_table
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- System can insert auth data
CREATE POLICY "System can insert auth data"
  ON auth_table
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own auth data
CREATE POLICY "Users can update own auth data"
  ON auth_table
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_auth_table_updated_at
  BEFORE UPDATE ON auth_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 