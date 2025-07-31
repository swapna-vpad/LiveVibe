/*
  # Create payment records table

  1. New Tables
    - `payment_records`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `payment_id` (text, Square payment ID)
      - `amount` (integer, amount in cents)
      - `currency` (text, currency code)
      - `status` (text, payment status)
      - `payment_type` (text, subscription or booking)
      - `plan_id` (uuid, optional, for subscription payments)
      - `booking_id` (uuid, optional, for booking payments)
      - `billing_cycle` (text, optional, for subscriptions)
      - `artist_fee` (integer, optional, for bookings)
      - `platform_fee` (integer, optional, for bookings)
      - `payment_date` (timestamptz, when payment was processed)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payment_records` table
    - Add policy for users to read their own payment records
    - Add policy for users to insert their own payment records
*/

CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payment_id text NOT NULL,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL,
  payment_type text NOT NULL CHECK (payment_type IN ('subscription', 'booking')),
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE SET NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'yearly')),
  artist_fee integer,
  platform_fee integer,
  payment_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payment records"
  ON payment_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment records"
  ON payment_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_payment_records_updated_at
  BEFORE UPDATE ON payment_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();