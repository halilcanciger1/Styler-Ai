/*
  # Create Storage Buckets for Fashion AI Platform

  1. Storage Buckets
    - `model-images` - For uploaded model photos
    - `garment-images` - For uploaded garment photos  
    - `generated-results` - For AI-generated fashion images
    - `avatars` - For user profile pictures

  2. Security
    - RLS policies for authenticated users to manage their own files
    - Public read access for generated results and avatars
    - Proper file size and MIME type restrictions
*/

-- Create storage buckets using Supabase functions
SELECT storage.create_bucket('model-images', '{"public": true, "file_size_limit": 52428800, "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/gif"]}');
SELECT storage.create_bucket('garment-images', '{"public": true, "file_size_limit": 52428800, "allowed_mime_types": ["image/jpeg", "image/png", "image/webp", "image/gif"]}');
SELECT storage.create_bucket('generated-results', '{"public": true, "file_size_limit": 52428800, "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]}');
SELECT storage.create_bucket('avatars', '{"public": true, "file_size_limit": 10485760, "allowed_mime_types": ["image/jpeg", "image/png", "image/webp"]}');

-- Create storage policies for model-images bucket
CREATE POLICY "Users can upload model images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'model-images');

CREATE POLICY "Users can view model images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'model-images');

CREATE POLICY "Users can delete own model images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'model-images' AND owner = auth.uid());

-- Create storage policies for garment-images bucket
CREATE POLICY "Users can upload garment images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'garment-images');

CREATE POLICY "Users can view garment images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'garment-images');

CREATE POLICY "Users can delete own garment images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'garment-images' AND owner = auth.uid());

-- Create storage policies for generated-results bucket
CREATE POLICY "Users can upload generated results" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'generated-results');

CREATE POLICY "Anyone can view generated results" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'generated-results');

CREATE POLICY "Users can delete own generated results" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'generated-results' AND owner = auth.uid());

-- Create storage policies for avatars bucket
CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());

CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND owner = auth.uid());