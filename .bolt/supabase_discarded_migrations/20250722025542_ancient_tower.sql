/*
  # Create subscription system

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - 'artist' or 'organizer'
      - `tier` (text) - 'starter', 'pro', 'elite'
      - `price_monthly` (integer) - price in cents
      - `price_yearly` (integer) - price in cents
      - `features` (text[]) - array of features
      - `commission_rate` (decimal) - commission rate as decimal
      - `ai_generations` (integer) - number of AI generations allowed
      - `active` (boolean) - whether plan is active
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `plan_id` (uuid, foreign key)
      - `status` (text) - 'active', 'cancelled', 'expired'
      - `billing_cycle` (text) - 'monthly' or 'yearly'
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own subscriptions
    - Add policies for reading subscription plans