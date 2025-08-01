/*
  # Add subscription_plan field to artist_profiles table

  1. New Field
    - `subscription_plan` (text) - 'freemium', 'vibe_pro', 'vibe_elite'
    - Default value: 'freemium'
    - NOT NULL constraint
    - CHECK constraint to ensure valid values

  2. Purpose
    - Track which subscription plan the artist is currently on
    - Aligns with the subscription_plans table structure
    - Enables subscription-based features and limitations
*/

-- Add subscription_plan column to artist_profiles table
ALTER TABLE artist_profiles 
ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'freemium' 
CHECK (subscription_plan IN ('freemium', 'vibe_pro', 'vibe_elite'));

-- Add comment to document the field
COMMENT ON COLUMN artist_profiles.subscription_plan IS 'Current subscription plan of the artist: freemium, vibe_pro, or vibe_elite'; 