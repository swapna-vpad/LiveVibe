/*
  # Create subscriptions and pricing tables

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text, plan name)
      - `type` (text, artist or organizer)
      - `tier` (text, starter/pro/elite)
      - `price_monthly` (integer, price in cents)
      - `price_yearly` (integer, price in cents)
      - `features` (jsonb, list of features)
      - `commission_rate` (decimal, booking commission rate)
      - `ai_generations` (integer, monthly AI generations allowed)
      - `active` (boolean, whether plan is active)

    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `plan_id` (uuid, foreign key to subscription_plans)
      - `status` (text, active/cancelled/expired)
      - `billing_cycle` (text, monthly/yearly)
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own subscriptions
    - Add policies for reading subscription plans
</sql>

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('artist', 'organizer')),
  tier text NOT NULL CHECK (tier IN ('starter', 'pro', 'elite')),
  price_monthly integer NOT NULL DEFAULT 0,
  price_yearly integer NOT NULL DEFAULT 0,
  features jsonb DEFAULT '[]'::jsonb,
  commission_rate decimal(3,2) NOT NULL DEFAULT 0.10,
  ai_generations integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trialing')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT now() + interval '1 month',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans (public read)
CREATE POLICY "Anyone can read subscription plans"
  ON subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Policies for user_subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger for user_subscriptions
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans
INSERT INTO subscription_plans (name, type, tier, price_monthly, price_yearly, features, commission_rate, ai_generations) VALUES
-- Artist Plans
('Vibe Starter', 'artist', 'starter', 0, 0, 
 '["Create public Artist Profile", "Listed in Booking Marketplace", "Receive booking requests", "Basic analytics", "Join community event rooms", "1 AI video generation per month (with watermark)", "Standard marketplace visibility"]'::jsonb, 
 0.10, 1),

('Vibe Pro', 'artist', 'pro', 1500, 15000, 
 '["All Vibe Starter features", "10 AI video generations per month (no watermark)", "One-click publishing to social media", "Advanced analytics", "Featured placement in search results", "Calendar integration", "Collaboration finder access"]'::jsonb, 
 0.10, 10),

('Vibe Elite', 'artist', 'elite', 3500, 35000, 
 '["All Vibe Pro features", "Unlimited AI video generations", "Premium visual styles and templates", "Elite Artist badge", "Highest priority in search rankings", "Direct booking widget", "Merch & livestream integration", "Priority customer support"]'::jsonb, 
 0.07, -1),

-- Organizer Plans
('Vibe Discovery', 'organizer', 'starter', 0, 0, 
 '["Create Organizer Profile", "Browse entire Artist Marketplace", "Send booking requests", "Bookmark favorite artists", "3 AI-powered artist suggestions per week", "Manage 1 active event"]'::jsonb, 
 0.10, 0),

('Vibe Pro', 'organizer', 'pro', 2500, 25000, 
 '["All Vibe Discovery features", "Unlimited event management", "Advanced search filters", "Unlimited AI suggestions", "Calendar integration", "Contract management", "Post on Collaborator Finder"]'::jsonb, 
 0.10, 0),

('Vibe Elite', 'organizer', 'elite', 6000, 60000, 
 '["All Vibe Pro features", "Team accounts", "Artists pay reduced 8% commission", "Direct outreach tools", "Custom analytics & reporting", "Dedicated account manager", "Priority support"]'::jsonb, 
 0.08, 0);