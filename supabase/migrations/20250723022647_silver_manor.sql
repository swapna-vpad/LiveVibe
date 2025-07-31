/*
  # AI Showcase Studio System

  1. New Tables
    - `ai_projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `description` (text)
      - `status` (text: draft, processing, completed, failed)
      - `project_type` (text: music_video, audio_visual, lyric_video)
      - `lyrics` (text)
      - `mood` (text)
      - `theme` (text)
      - `style` (text)
      - `audio_file_url` (text)
      - `image_files` (text array)
      - `video_snippets` (text array)
      - `ai_settings` (jsonb)
      - `output_video_url` (text)
      - `youtube_video_id` (text)
      - `youtube_upload_status` (text)
      - `seo_settings` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `completed_at` (timestamp)

    - `ai_generations_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `month_year` (text)
      - `generations_used` (integer)
      - `plan_limit` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for users to manage their own data
    - Add policies for public read access where appropriate
</system_reminders>

-- Create AI projects table
CREATE TABLE IF NOT EXISTS ai_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
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
  output_video_url text,
  youtube_video_id text,
  youtube_upload_status text DEFAULT 'pending' CHECK (youtube_upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  seo_settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create AI generations usage tracking table
CREATE TABLE IF NOT EXISTS ai_generations_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  month_year text NOT NULL,
  generations_used integer DEFAULT 0,
  plan_limit integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Enable RLS
ALTER TABLE ai_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_generations_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_projects
CREATE POLICY "Users can read own projects"
  ON ai_projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON ai_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON ai_projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON ai_projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for ai_generations_usage
CREATE POLICY "Users can read own usage"
  ON ai_generations_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON ai_generations_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON ai_generations_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger for ai_projects
CREATE TRIGGER update_ai_projects_updated_at
  BEFORE UPDATE ON ai_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for ai_generations_usage
CREATE TRIGGER update_ai_generations_usage_updated_at
  BEFORE UPDATE ON ai_generations_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS ai_projects_user_id_idx ON ai_projects(user_id);
CREATE INDEX IF NOT EXISTS ai_projects_status_idx ON ai_projects(status);
CREATE INDEX IF NOT EXISTS ai_projects_created_at_idx ON ai_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS ai_generations_usage_user_month_idx ON ai_generations_usage(user_id, month_year);