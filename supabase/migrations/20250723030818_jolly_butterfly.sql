/*
  # Create Storage Buckets for AI Showcase Studio

  1. Storage Buckets
    - `ai-studio-files` - For AI project media files (audio, images, videos)
    - `ai-generated-videos` - For completed AI-generated videos
    - `profile-photos` - For user profile photos

  2. Security Policies
    - Users can upload to their own folders
    - Public read access for generated content
    - Proper file type and size restrictions
*/

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