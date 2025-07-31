/*
  # Live Vibe Database Setup
  
  This script creates all the necessary tables and policies for the Live Vibe application.
  Copy and paste this entire script into your Supabase SQL editor and run it.
  
  Tables created:
  - artist_profiles
  - promoter_profiles  
  - art_pieces
  - subscription_plans
  - user_subscriptions
  - ai_projects
  - ai_generations_usage
  - events
  - bookings
  - artist_availability
  - user_favorites
  
  Storage buckets and policies are also created.
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create artist_profiles table
CREATE TABLE IF NOT EXISTS artist_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  phone_number text,
  city text,
  state text,
  country text,
  travel_distance integer,
  profile_photo_url text,
  instagram text,
  tiktok text,
  pinterest text,
  youtube text,
  behance text,
  facebook text,
  linkedin text,
  spotify text,
  artist_type text CHECK (artist_type IN ('visual', 'performing', 'both')),
  visual_artist_category text,
  performing_artist_type text CHECK (performing_artist_type IN ('singer', 'instrumentalist', 'both')),
  music_genres text[],
  instruments text[],
  subscription_plan text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create promoter_profiles table
CREATE TABLE IF NOT EXISTS promoter_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text,
  city text,
  state text,
  country text,
  number_of_clients integer DEFAULT 0,
  profile_photo_url text,
  instagram text,
  tiktok text,
  pinterest text,
  youtube text,
  behance text,
  facebook text,
  linkedin text,
  spotify text,
  promoter_type text NOT NULL CHECK (promoter_type IN ('promoter', 'curator')),
  subscription_plan text NOT NULL CHECK (subscription_plan IN ('freemium', 'vibe_pro', 'vibe_elite')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create art_pieces table
CREATE TABLE IF NOT EXISTS art_pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('image', 'audio', 'video', 'document')),
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('artist', 'organizer')),
  tier text NOT NULL CHECK (tier IN ('starter', 'pro', 'elite')),
  price_monthly integer DEFAULT 0 NOT NULL,
  price_yearly integer DEFAULT 0 NOT NULL,
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

-- Create ai_projects table
CREATE TABLE IF NOT EXISTS ai_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'failed')),
  project_type text DEFAULT 'music_video' CHECK (project_type IN ('music_video', 'audio_visual', 'lyric_video')),
  lyrics text DEFAULT '',
  mood text DEFAULT '',
  theme text DEFAULT '',
  style text DEFAULT '',
  audio_file_url text,
  image_files text[] DEFAULT '{}',
  video_snippets text[] DEFAULT '{}',
  ai_settings jsonb DEFAULT '{}',
  kling_task_id text,
  kling_prompt text,
  kling_negative_prompt text,
  error_message text,
  output_video_url text,
  video_duration integer DEFAULT 10,
  video_quality text DEFAULT 'pro',
  youtube_video_id text,
  youtube_upload_status text DEFAULT 'pending' CHECK (youtube_upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  youtube_url text,
  seo_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create ai_generations_usage table
CREATE TABLE IF NOT EXISTS ai_generations_usage (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  generations_used integer DEFAULT 0 NOT NULL,
  plan_limit integer DEFAULT 1 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, month_year)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organizer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  event_date timestamptz NOT NULL,
  venue_name text NOT NULL,
  venue_address text,
  city text NOT NULL,
  state text,
  country text,
  budget_min integer DEFAULT 0,
  budget_max integer DEFAULT 0,
  event_type text,
  duration_hours integer DEFAULT 2,
  audience_size integer DEFAULT 0,
  required_genres text[] DEFAULT '{}',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'booking_open', 'booked', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  artist_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organizer_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  proposed_fee integer NOT NULL,
  final_fee integer DEFAULT 0,
  message text,
  contract_terms text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create artist_availability table
CREATE TABLE IF NOT EXISTS artist_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  start_time time,
  end_time time,
  is_available boolean DEFAULT true,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  artist_id uuid NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, artist_id)
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
CREATE INDEX IF NOT EXISTS user_favorites_user_id_idx ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS user_favorites_artist_id_idx ON user_favorites(artist_id);

-- Enable Row Level Security on all tables
ALTER TABLE artist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE art_pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for artist_profiles
CREATE POLICY "Users can read own profile" ON artist_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON artist_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON artist_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON artist_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read all profiles" ON artist_profiles
  FOR SELECT TO anon, authenticated
  USING (true);

-- Create RLS policies for promoter_profiles
CREATE POLICY "Users can read own promoter profile" ON promoter_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own promoter profile" ON promoter_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own promoter profile" ON promoter_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own promoter profile" ON promoter_profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read all promoter profiles" ON promoter_profiles
  FOR SELECT TO anon, authenticated
  USING (true);

-- Create RLS policies for art_pieces
CREATE POLICY "Users can read own art pieces" ON art_pieces
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read all art pieces" ON art_pieces
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own art pieces" ON art_pieces
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own art pieces" ON art_pieces
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own art pieces" ON art_pieces
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for subscription_plans
CREATE POLICY "Public can read subscription plans" ON subscription_plans
  FOR SELECT TO anon, authenticated
  USING (active = true);

-- Create RLS policies for user_subscriptions
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

-- Create RLS policies for ai_projects
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

-- Create RLS policies for ai_generations_usage
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

-- Create RLS policies for events
CREATE POLICY "Users can read own events" ON events
  FOR SELECT TO authenticated
  USING (auth.uid() = organizer_id);

CREATE POLICY "Public can read published events" ON events
  FOR SELECT TO anon, authenticated
  USING (status IN ('published', 'booking_open'));

CREATE POLICY "Users can insert own events" ON events
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update own events" ON events
  FOR UPDATE TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can delete own events" ON events
  FOR DELETE TO authenticated
  USING (auth.uid() = organizer_id);

-- Create RLS policies for bookings
CREATE POLICY "Users can read own bookings" ON bookings
  FOR SELECT TO authenticated
  USING (auth.uid() = artist_id OR auth.uid() = organizer_id);

CREATE POLICY "Users can insert bookings" ON bookings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update relevant bookings" ON bookings
  FOR UPDATE TO authenticated
  USING (auth.uid() = artist_id OR auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = artist_id OR auth.uid() = organizer_id);

-- Create RLS policies for artist_availability
CREATE POLICY "Users can manage own availability" ON artist_availability
  FOR ALL TO authenticated
  USING (auth.uid() = artist_id)
  WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Public can read availability" ON artist_availability
  FOR SELECT TO anon, authenticated
  USING (true);

-- Create RLS policies for user_favorites
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL TO authenticated
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
CREATE TRIGGER update_artist_profiles_updated_at
  BEFORE UPDATE ON artist_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promoter_profiles_updated_at
  BEFORE UPDATE ON promoter_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_art_pieces_updated_at
  BEFORE UPDATE ON art_pieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_projects_updated_at
  BEFORE UPDATE ON ai_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_generations_usage_updated_at
  BEFORE UPDATE ON ai_generations_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_availability_updated_at
  BEFORE UPDATE ON artist_availability
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

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES
('ai-studio-files', 'ai-studio-files', false, 104857600, ARRAY[
  'image/jpeg',
  'image/png', 
  'image/gif',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/mp3',
  'audio/mp4',
  'audio/aac',
  'video/mp4',
  'video/mov',
  'video/avi',
  'video/quicktime',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]),
('ai-generated-videos', 'ai-generated-videos', true, 524288000, ARRAY[
  'video/mp4',
  'video/mov',
  'video/avi',
  'video/quicktime'
]),
('profile-photos', 'profile-photos', true, 10485760, ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]),
('art-pieces', 'art-pieces', true, 52428800, ARRAY[
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'audio/mpeg',
  'audio/wav',
  'audio/mp3',
  'audio/mp4',
  'audio/aac',
  'video/mp4',
  'video/mov',
  'video/avi',
  'video/quicktime',
  'application/pdf'
])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for ai-studio-files bucket
CREATE POLICY "Users can upload their own files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ai-studio-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view their own files" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'ai-studio-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their own files" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'ai-studio-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'ai-studio-files' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for ai-generated-videos bucket (public read)
CREATE POLICY "Anyone can view generated videos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'ai-generated-videos');

CREATE POLICY "Users can upload generated videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'ai-generated-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their generated videos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'ai-generated-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their generated videos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'ai-generated-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for profile-photos bucket (public read)
CREATE POLICY "Anyone can view profile photos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-photos');

CREATE POLICY "Users can upload their profile photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'profile-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their profile photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'profile-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their profile photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'profile-photos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for art-pieces bucket
CREATE POLICY "Users can upload their own art pieces" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'art-pieces' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view all art pieces" ON storage.objects
  FOR SELECT TO authenticated, anon
  USING (bucket_id = 'art-pieces');

CREATE POLICY "Users can update their own art pieces" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'art-pieces' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their own art pieces" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'art-pieces' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Helper functions for AI usage tracking
CREATE OR REPLACE FUNCTION get_user_ai_usage(user_uuid uuid)
RETURNS TABLE(
  generations_used integer,
  plan_limit integer,
  can_generate boolean
) AS $$
DECLARE
  current_month text := to_char(now(), 'YYYY-MM');
  usage_record record;
  subscription_record record;
BEGIN
  -- Get current subscription
  SELECT sp.ai_generations INTO subscription_record
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND us.current_period_end > now()
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- Default to free tier if no subscription
  IF subscription_record IS NULL THEN
    subscription_record.ai_generations := 1;
  END IF;

  -- Get or create usage record
  SELECT * INTO usage_record
  FROM ai_generations_usage
  WHERE user_id = user_uuid AND month_year = current_month;

  IF usage_record IS NULL THEN
    INSERT INTO ai_generations_usage (user_id, month_year, generations_used, plan_limit)
    VALUES (user_uuid, current_month, 0, subscription_record.ai_generations)
    RETURNING * INTO usage_record;
  END IF;

  -- Return usage information
  RETURN QUERY SELECT 
    usage_record.generations_used,
    usage_record.plan_limit,
    (usage_record.plan_limit = -1 OR usage_record.generations_used < usage_record.plan_limit) as can_generate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION increment_ai_usage(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  current_month text := to_char(now(), 'YYYY-MM');
  can_generate boolean;
BEGIN
  -- Check if user can generate
  SELECT get_user_ai_usage.can_generate INTO can_generate
  FROM get_user_ai_usage(user_uuid);

  IF NOT can_generate THEN
    RETURN false;
  END IF;

  -- Increment usage
  INSERT INTO ai_generations_usage (user_id, month_year, generations_used, plan_limit)
  VALUES (user_uuid, current_month, 1, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    generations_used = ai_generations_usage.generations_used + 1,
    updated_at = now();

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;