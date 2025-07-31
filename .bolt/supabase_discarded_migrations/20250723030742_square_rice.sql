/*
  # Complete AI Showcase Studio Workflow System

  1. New Tables
    - `ai_projects` - Store AI video generation projects
    - `ai_generations_usage` - Track monthly AI generation usage per user
    - `subscription_plans` - Define available subscription plans
    - `user_subscriptions` - Track user subscription status

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add public read access for subscription plans

  3. Features
    - Complete project lifecycle management
    - Usage tracking and limits
    - Subscription-based access control
    - File storage integration
    - YouTube upload tracking
    - Kling AI integration fields
*/

-- Create ai_projects table
CREATE TABLE IF NOT EXISTS ai_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  project_type text DEFAULT 'music_video' CHECK (project_type IN ('music_video', 'audio_visual', 'lyric_video')),
  
  -- Content fields
  lyrics text DEFAULT '',
  mood text DEFAULT '',
  theme text DEFAULT '',
  style text DEFAULT '',
  
  -- Media files
  audio_file_url text,
  image_files text[] DEFAULT '{}',
  video_snippets text[] DEFAULT '{}',
  
  -- AI settings
  ai_settings jsonb DEFAULT '{}',
  
  -- Kling AI integration
  kling_task_id text,
  kling_prompt text,
  kling_negative_prompt text,
  error_message text,
  
  -- Output
  output_video_url text,
  video_duration integer DEFAULT 10,
  video_quality text DEFAULT 'pro',
  
  -- YouTube integration
  youtube_video_id text,
  youtube_upload_status text DEFAULT 'pending' CHECK (youtube_upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  youtube_url text,
  seo_settings jsonb DEFAULT '{}',
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create ai_generations_usage table
CREATE TABLE IF NOT EXISTS ai_generations_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL, -- Format: YYYY-MM
  generations_used integer DEFAULT 0 NOT NULL,
  plan_limit integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, month_year)
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('artist', 'organizer')),
  tier text NOT NULL CHECK (tier IN ('starter', 'pro', 'elite')),
  price_monthly integer DEFAULT 0 NOT NULL, -- in cents
  price_yearly integer DEFAULT 0 NOT NULL, -- in cents
  features text[] DEFAULT '{}' NOT NULL,
  commission_rate numeric(3,2) DEFAULT 0.10 NOT NULL,
  ai_generations integer DEFAULT 0 NOT NULL,
  active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  billing_cycle text DEFAULT 'monthly' NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start timestamptz DEFAULT now() NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS ai_projects_user_id_idx ON ai_projects(user_id);
CREATE INDEX IF NOT EXISTS ai_projects_status_idx ON ai_projects(status);
CREATE INDEX IF NOT EXISTS ai_projects_created_at_idx ON ai_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_projects_kling_task_id_idx ON ai_projects(kling_task_id);

CREATE INDEX IF NOT EXISTS ai_generations_usage_user_id_idx ON ai_generations_usage(user_id);
CREATE INDEX IF NOT EXISTS ai_generations_usage_month_year_idx ON ai_generations_usage(month_year);

CREATE INDEX IF NOT EXISTS subscription_plans_type_tier_idx ON subscription_plans(type, tier);
CREATE INDEX IF NOT EXISTS subscription_plans_active_idx ON subscription_plans(active);

CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_status_idx ON user_subscriptions(status);

-- Enable Row Level Security
ALTER TABLE ai_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- AI Projects policies
CREATE POLICY "Users can read own projects" ON ai_projects
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON ai_projects
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON ai_projects
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON ai_projects
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- AI Generations Usage policies
CREATE POLICY "Users can read own usage data" ON ai_generations_usage
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage data" ON ai_generations_usage
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage data" ON ai_generations_usage
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Subscription Plans policies (public read access)
CREATE POLICY "Public can read subscription plans" ON subscription_plans
  FOR SELECT TO anon, authenticated
  USING (active = true);

-- User Subscriptions policies
CREATE POLICY "Users can read own subscriptions" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON user_subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_ai_projects_updated_at
  BEFORE UPDATE ON ai_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_generations_usage_updated_at
  BEFORE UPDATE ON ai_generations_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default subscription plans
INSERT INTO subscription_plans (name, type, tier, price_monthly, price_yearly, features, commission_rate, ai_generations, active) VALUES
-- Artist Plans
('Vibe Discovery', 'artist', 'starter', 0, 0, ARRAY[
  'Create Artist Profile',
  'Upload unlimited art pieces',
  'Basic profile customization',
  'Connect social media accounts',
  'Get discovered by organizers',
  '1 AI generation per month'
], 0.10, 1, true),

('Vibe Pro', 'artist', 'pro', 2500, 25000, ARRAY[
  'All Discovery features',
  'Advanced profile customization',
  'Priority in search results',
  'Analytics and insights',
  'Direct messaging with organizers',
  'Portfolio showcase tools',
  '10 AI generations per month',
  'Custom branding options'
], 0.10, 10, true),

('Vibe Elite', 'artist', 'elite', 6000, 60000, ARRAY[
  'All Pro features',
  'Reduced 7% commission rate',
  'Dedicated account manager',
  'Advanced analytics dashboard',
  'Priority customer support',
  'Featured artist placement',
  'Unlimited AI generations',
  'Custom portfolio website',
  'Collaboration tools'
], 0.07, -1, true),

-- Organizer Plans
('Vibe Discovery', 'organizer', 'starter', 0, 0, ARRAY[
  'Create Organizer Profile',
  'Browse Artist Marketplace',
  'Send booking requests',
  'Bookmark favorite artists',
  'Limited to 3 AI suggestions/week',
  'Manage 1 active event'
], 0.10, 1, true),

('Vibe Pro', 'organizer', 'pro', 2500, 25000, ARRAY[
  'All Discovery features',
  'Unlimited event management',
  'Advanced search filters',
  'Unlimited AI suggestions',
  'Calendar integration',
  'Contract management',
  'Collaborator Finder access'
], 0.10, 10, true),

('Vibe Elite', 'organizer', 'elite', 6000, 60000, ARRAY[
  'All Pro features',
  'Team accounts',
  'Reduced 8% commission for artists',
  'Direct outreach tools',
  'Custom analytics & reporting',
  'Dedicated account manager',
  'Priority support'
], 0.08, -1, true)

ON CONFLICT DO NOTHING;