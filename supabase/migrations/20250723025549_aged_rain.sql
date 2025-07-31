/*
  # Create AI Generations Usage Table

  1. New Tables
    - `ai_generations_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `month_year` (text, format YYYY-MM)
      - `generations_used` (integer, default 0)
      - `plan_limit` (integer, default 1)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ai_generations_usage` table
    - Add policy for users to read/write their own usage data

  3. Constraints
    - Unique constraint on (user_id, month_year) combination
    - Foreign key constraint to users table
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ai_generations_usage table
CREATE TABLE IF NOT EXISTS ai_generations_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  generations_used integer DEFAULT 0 NOT NULL,
  plan_limit integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, month_year)
);

-- Enable RLS
ALTER TABLE ai_generations_usage ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own usage data"
  ON ai_generations_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage data"
  ON ai_generations_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage data"
  ON ai_generations_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_generations_usage_updated_at
  BEFORE UPDATE ON ai_generations_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();