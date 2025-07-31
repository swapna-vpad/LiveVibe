/*
  # Auth Table Migration and Setup

  1. Tables
    - Ensure `auth_table` exists with proper structure
    - Add indexes for performance
    - Set up RLS policies

  2. Security
    - Enable RLS on `auth_table`
    - Add policies for user authentication
    - Ensure proper access controls

  3. Functions
    - Create helper functions for authentication
    - Add triggers for data consistency
*/

-- Ensure auth_table exists with proper structure
CREATE TABLE IF NOT EXISTS auth_table (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at timestamptz DEFAULT now() NOT NULL,
  user_name character varying NOT NULL,
  password text NOT NULL,
  module character varying DEFAULT 'artist'::character varying,
  email character varying UNIQUE NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  last_login timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Add email column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auth_table' AND column_name = 'email'
  ) THEN
    ALTER TABLE auth_table ADD COLUMN email character varying UNIQUE NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add additional columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auth_table' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE auth_table ADD COLUMN is_active boolean DEFAULT true NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auth_table' AND column_name = 'last_login'
  ) THEN
    ALTER TABLE auth_table ADD COLUMN last_login timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'auth_table' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE auth_table ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auth_table_email ON auth_table(email);
CREATE INDEX IF NOT EXISTS idx_auth_table_user_name ON auth_table(user_name);
CREATE INDEX IF NOT EXISTS idx_auth_table_module ON auth_table(module);

-- Enable RLS
ALTER TABLE auth_table ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own auth data" ON auth_table;
DROP POLICY IF EXISTS "Users can insert own auth data" ON auth_table;
DROP POLICY IF EXISTS "Users can update own auth data" ON auth_table;
DROP POLICY IF EXISTS "Public can create accounts" ON auth_table;

-- Create RLS policies
CREATE POLICY "Public can create accounts"
  ON auth_table
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read own auth data"
  ON auth_table
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email' OR user_name = auth.jwt() ->> 'user_name');

CREATE POLICY "Users can update own auth data"
  ON auth_table
  FOR UPDATE
  TO authenticated
  USING (email = auth.jwt() ->> 'email' OR user_name = auth.jwt() ->> 'user_name')
  WITH CHECK (email = auth.jwt() ->> 'email' OR user_name = auth.jwt() ->> 'user_name');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_auth_table_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_auth_table_updated_at_trigger ON auth_table;
CREATE TRIGGER update_auth_table_updated_at_trigger
  BEFORE UPDATE ON auth_table
  FOR EACH ROW
  EXECUTE FUNCTION update_auth_table_updated_at();

-- Create function to hash passwords (basic implementation)
CREATE OR REPLACE FUNCTION hash_password(password_text text)
RETURNS text AS $$
BEGIN
  -- In production, use a proper password hashing library
  -- This is a simple example using crypt extension
  RETURN crypt(password_text, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to verify passwords
CREATE OR REPLACE FUNCTION verify_password(password_text text, hashed_password text)
RETURNS boolean AS $$
BEGIN
  RETURN crypt(password_text, hashed_password) = hashed_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function for custom authentication
CREATE OR REPLACE FUNCTION authenticate_user(
  email_or_username text,
  password_text text
)
RETURNS TABLE(
  id bigint,
  user_name character varying,
  email character varying,
  module character varying,
  is_active boolean,
  last_login timestamptz
) AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Find user by email or username
  SELECT * INTO user_record
  FROM auth_table
  WHERE (auth_table.email = email_or_username OR auth_table.user_name = email_or_username)
    AND auth_table.is_active = true;

  -- Check if user exists and password is correct
  IF user_record IS NOT NULL AND verify_password(password_text, user_record.password) THEN
    -- Update last login
    UPDATE auth_table 
    SET last_login = now() 
    WHERE auth_table.id = user_record.id;

    -- Return user data
    RETURN QUERY
    SELECT 
      user_record.id,
      user_record.user_name,
      user_record.email,
      user_record.module,
      user_record.is_active,
      now() as last_login;
  END IF;

  -- Return empty if authentication failed
  RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON auth_table TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE auth_table_id_seq TO anon, authenticated;