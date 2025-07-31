/*
  # Add Spotify to artist profiles

  1. Changes
    - Add `spotify` column to `artist_profiles` table for Spotify profile URLs

  2. Security
    - No changes to existing RLS policies needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'artist_profiles' AND column_name = 'spotify'
  ) THEN
    ALTER TABLE artist_profiles ADD COLUMN spotify text;
  END IF;
END $$;