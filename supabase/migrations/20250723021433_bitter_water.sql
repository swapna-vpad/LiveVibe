/*
  # Create subscription plans system

  1. New Tables
    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - 'artist' or 'organizer'
      - `tier` (text) - 'starter', 'pro', 'elite'
      - `price_monthly` (integer) - price in cents
      - `price_yearly` (integer) - price in cents
      - `features` (text array)
      - `commission_rate` (decimal)
      - `ai_generations` (integer)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `plan_id` (uuid, foreign key)
      - `status` (text) - 'active', 'cancelled', 'expired'
      - `billing_cycle` (text) - 'monthly', 'yearly'
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their subscriptions
    - Add policies for public read access to subscription plans
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('artist', 'organizer')),
  tier text NOT NULL CHECK (tier IN ('starter', 'pro', 'elite')),
  price_monthly integer NOT NULL DEFAULT 0,
  price_yearly integer NOT NULL DEFAULT 0,
  features text[] NOT NULL DEFAULT '{}',
  commission_rate decimal(3,2) NOT NULL DEFAULT 0.10,
  ai_generations integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans
CREATE POLICY "Public can read subscription plans"
  ON subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

-- Policies for user_subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert Artist subscription plans
INSERT INTO subscription_plans (name, type, tier, price_monthly, price_yearly, features, commission_rate, ai_generations) VALUES
(
  'Vibe Starter',
  'artist',
  'starter',
  0,
  0,
  ARRAY[
    'Create a public, shareable Artist Profile',
    'Be listed in the Booking Marketplace',
    'Receive booking requests',
    'Basic analytics (profile views, number of inquiries)',
    'Join community event rooms',
    'AI Showcase Studio: 1 free AI video generation per month (with watermark)',
    'Marketplace Visibility: Standard listing in search results'
  ],
  0.10,
  1
),
(
  'Vibe Pro',
  'artist',
  'pro',
  1500,
  15000,
  ARRAY[
    'All Vibe Starter features',
    'AI Showcase Studio: 10 AI video generations per month (no watermark)',
    'One-click publishing to TikTok, Instagram, and YouTube',
    'Advanced Analytics: See engagement stats, follower growth, and profile views',
    'Marketplace Priority: Featured placement in search results',
    'Calendar Integration: Auto-sync bookings with personal calendars',
    'Collaboration Finder: Full access to find and connect with collaborators'
  ],
  0.10,
  10
),
(
  'Vibe Elite',
  'artist',
  'elite',
  3500,
  35000,
  ARRAY[
    'All Vibe Pro features',
    'AI Showcase Studio: Unlimited AI video generations',
    'Access to premium visual styles and templates',
    'Reduced Booking Commission: Commission reduced to 7%',
    'Top-Tier Marketplace Visibility: "Elite Artist" badge on profile',
    'Direct Booking Link: Personal, embeddable booking widget',
    'Merch & Livestream Integration: In-app tools for merchandise and ticketed events',
    'Priority customer support'
  ],
  0.07,
  -1
);

-- Insert Organizer subscription plans
INSERT INTO subscription_plans (name, type, tier, price_monthly, price_yearly, features, commission_rate, ai_generations) VALUES
(
  'Vibe Discovery',
  'organizer',
  'starter',
  0,
  0,
  ARRAY[
    'Create an Organizer Profile',
    'Browse and search the entire Artist Marketplace',
    'Send booking requests to any artist',
    'Bookmark favorite artists',
    'AI Suggestions: Limited to 3 AI-powered artist suggestions per week',
    'Event Management: Can only manage 1 active event at a time',
    'No access to advanced search filters'
  ],
  0.10,
  3
),
(
  'Vibe Pro',
  'organizer',
  'pro',
  2500,
  25000,
  ARRAY[
    'All Vibe Discovery features',
    'Unlimited Event Management: Manage multiple events simultaneously',
    'Advanced Search Filters: Filter by real-time availability, price range, and more',
    'Smart AI Suggestions: Unlimited, tailored artist recommendations',
    'Calendar Integration: Sync all event and booking dates to your calendar',
    'Contract Management: Access to standardized contract templates and in-app signing',
    'Post on the Collaborator Finder board'
  ],
  0.10,
  -1
),
(
  'Vibe Elite',
  'organizer',
  'elite',
  6000,
  60000,
  ARRAY[
    'All Vibe Pro features',
    'Team Accounts: Add multiple team members under one organizational account',
    'Reduced Commission for Your Bookings: Artists pay reduced 8% commission',
    'Direct Outreach Tools: Advanced messaging and campaign tools',
    'Custom Analytics & Reporting: In-depth reports on booking spend and ROI',
    'Dedicated account manager and priority support'
  ],
  0.08,
  -1
);