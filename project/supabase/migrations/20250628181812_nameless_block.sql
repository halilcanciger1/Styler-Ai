/*
  # Create Storage Buckets for Fashion AI Application

  1. Storage Buckets
    - `model-images` - For storing uploaded model photos
    - `garment-images` - For storing uploaded garment photos  
    - `generated-results` - For storing AI-generated fashion images
    - `avatars` - For storing user profile avatars

  2. Security
    - Enable RLS on all buckets
    - Add policies for authenticated users to manage their own files
    - Allow public read access for generated results and avatars
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('model-images', 'model-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('garment-images', 'garment-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('generated-results', 'generated-results', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload their own model images
CREATE POLICY "Users can upload model images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'model-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can view model images
CREATE POLICY "Users can view model images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'model-images');

-- Policy: Users can delete their own model images
CREATE POLICY "Users can delete own model images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'model-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can upload their own garment images
CREATE POLICY "Users can upload garment images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'garment-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can view garment images
CREATE POLICY "Users can view garment images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'garment-images');

-- Policy: Users can delete their own garment images
CREATE POLICY "Users can delete own garment images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'garment-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can upload their own generated results
CREATE POLICY "Users can upload generated results"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'generated-results' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Anyone can view generated results (public)
CREATE POLICY "Anyone can view generated results"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'generated-results');

-- Policy: Users can delete their own generated results
CREATE POLICY "Users can delete own generated results"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'generated-results' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can upload their own avatars
CREATE POLICY "Users can upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Anyone can view avatars (public)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );