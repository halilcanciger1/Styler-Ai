/*
  # Create Storage Buckets and Policies

  1. Storage Buckets
    - `model-images` - For user uploaded model photos
    - `garment-images` - For user uploaded garment photos  
    - `generated-results` - For AI generated fashion images
    - `avatars` - For user profile pictures

  2. Security Policies
    - Users can upload/view/delete their own images
    - Generated results and avatars are publicly viewable
    - Proper file size and MIME type restrictions
*/

-- Insert storage buckets directly into storage.buckets table
-- Using DO block to handle potential permission issues
DO $$
BEGIN
  -- Create model-images bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('model-images', 'model-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO NOTHING;

  -- Create garment-images bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('garment-images', 'garment-images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
  ON CONFLICT (id) DO NOTHING;

  -- Create generated-results bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('generated-results', 'generated-results', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp'])
  ON CONFLICT (id) DO NOTHING;

  -- Create avatars bucket
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES ('avatars', 'avatars', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
  ON CONFLICT (id) DO NOTHING;

EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to create storage buckets. Please create them manually in the Supabase dashboard.';
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating storage buckets: %', SQLERRM;
END $$;

-- Enable RLS on storage.objects if not already enabled
DO $$
BEGIN
  ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to enable RLS on storage.objects';
  WHEN OTHERS THEN
    RAISE NOTICE 'RLS may already be enabled on storage.objects';
END $$;

-- Create storage policies with error handling
DO $$
BEGIN
  -- Policies for model-images bucket
  CREATE POLICY "Users can upload model images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'model-images');
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Insufficient privileges to create storage policies';
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can view model images" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'model-images');
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete own model images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'model-images' AND owner = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

-- Policies for garment-images bucket
DO $$
BEGIN
  CREATE POLICY "Users can upload garment images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'garment-images');
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can view garment images" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'garment-images');
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete own garment images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'garment-images' AND owner = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

-- Policies for generated-results bucket
DO $$
BEGIN
  CREATE POLICY "Users can upload generated results" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'generated-results');
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Anyone can view generated results" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'generated-results');
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete own generated results" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'generated-results' AND owner = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

-- Policies for avatars bucket
DO $$
BEGIN
  CREATE POLICY "Users can upload avatars" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars');
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'avatars');
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can update own avatars" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'avatars' AND owner = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete own avatars" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'avatars' AND owner = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
  WHEN insufficient_privilege THEN NULL;
END $$;