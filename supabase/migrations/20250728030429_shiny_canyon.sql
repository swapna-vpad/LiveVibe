/*
  # Fix AI Generations Usage Table

  1. Changes
    - Ensure `ai_generations_usage` table exists with correct structure
    - Add proper constraints and indexes
    - Fix foreign key reference to use auth.users instead of users table

  2. Security
    - Enable RLS on `ai_generations_usage` table
    - Add policies for authenticated users to manage their own usage data
*/

-- Drop existing table if it exists to recreate with correct structure
DROP TABLE IF EXISTS public.ai_generations_usage CASCADE;

CREATE TABLE public.ai_generations_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    month_year text NOT NULL,
    generations_used integer DEFAULT 0 NOT NULL,
    plan_limit integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ai_generations_usage_pkey PRIMARY KEY (id),
    CONSTRAINT ai_generations_usage_user_id_month_year_key UNIQUE (user_id, month_year),
    CONSTRAINT ai_generations_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE public.ai_generations_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own usage data"
  ON public.ai_generations_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own usage data"
  ON public.ai_generations_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage data"
  ON public.ai_generations_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ai_generations_usage_updated_at
    BEFORE UPDATE ON public.ai_generations_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();