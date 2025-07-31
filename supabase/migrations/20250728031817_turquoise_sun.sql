/*
  # Add payment fields to bookings table

  1. Changes
    - Add `payment_status` column to bookings table
    - Add `payment_id` column to store Square payment ID
    - Add `payment_date` column to track when payment was made
    - Update existing bookings to have 'pending' payment status

  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  -- Add payment_status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'payment_status'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed'));
  END IF;

  -- Add payment_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'payment_id'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_id text;
  END IF;

  -- Add payment_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE bookings ADD COLUMN payment_date timestamptz;
  END IF;
END $$;