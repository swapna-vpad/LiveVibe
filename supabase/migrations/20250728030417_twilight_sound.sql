/*
  # Create AI Projects Table

  1. New Tables
    - `ai_projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, required)
      - `description` (text, optional)
      - `status` (text, default 'draft')
      - `project_type` (text, required)
      - `lyrics` (text, optional)
      - `mood` (text, optional)
      - `theme` (text, optional)
      - `style` (text, optional)
      - `audio_file_url` (text, optional)
      - `image_files` (text array, optional)
      - `video_snippets` (text array, optional)
      - `ai_settings` (jsonb, optional)
      - `output_video_url` (text, optional)
      - `youtube_video_id` (text, optional)
      - `youtube_upload_status` (text, default 'pending')
      - `seo_settings` (jsonb, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `completed_at` (timestamp, optional)
      - `kling_task_id` (text, optional)
      - `kling_prompt` (text, optional)
      - `kling_negative_prompt` (text, optional)
      - `error_message` (text, optional)

  2. Security
    - Enable RLS on `ai_projects` table
    - Add policies for authenticated users to manage their own projects
    - Add public read access for all projects
*/

CREATE TABLE IF NOT EXISTS public.ai_projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text,
    status text DEFAULT 'draft'::text NOT NULL,
    project_type text NOT NULL,
    lyrics text DEFAULT ''::text,
    mood text,
    theme text,
    style text,
    audio_file_url text,
    image_files text[] DEFAULT '{}',
    video_snippets text[] DEFAULT '{}',
    ai_settings jsonb DEFAULT '{}'::jsonb,
    output_video_url text,
    youtube_video_id text,
    youtube_upload_status text DEFAULT 'pending'::text NOT NULL,
    seo_settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    kling_task_id text,
    kling_prompt text,
    kling_negative_prompt text,
    error_message text,
    CONSTRAINT ai_projects_pkey PRIMARY KEY (id),
    CONSTRAINT ai_projects_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT ai_projects_status_check CHECK (status = ANY (ARRAY['draft'::text, 'processing'::text, 'completed'::text, 'failed'::text])),
    CONSTRAINT ai_projects_project_type_check CHECK (project_type = ANY (ARRAY['music_video'::text, 'audio_visual'::text, 'lyric_video'::text])),
    CONSTRAINT ai_projects_youtube_upload_status_check CHECK (youtube_upload_status = ANY (ARRAY['pending'::text, 'uploading'::text, 'completed'::text, 'failed'::text]))
);

ALTER TABLE public.ai_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read all ai projects"
  ON public.ai_projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own ai projects"
  ON public.ai_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own ai projects"
  ON public.ai_projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own ai projects"
  ON public.ai_projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai projects"
  ON public.ai_projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_ai_projects_updated_at
    BEFORE UPDATE ON public.ai_projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();