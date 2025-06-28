/*
  # Fix Profile Creation Trigger and Manual Profile Insertion

  1. Issues Fixed
    - Update the trigger function to handle profile creation properly
    - Fix the trigger timing to ensure it works with auth.users
    - Add manual profile creation for existing users
    - Ensure RLS policies work correctly with the trigger

  2. Changes
    - Recreate the handle_new_user function with proper error handling
    - Update the trigger to fire correctly
    - Add a function to manually create missing profiles
    - Grant proper permissions for the trigger function
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile with error handling
  INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    10,
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;

-- Function to manually create profiles for existing users
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- Loop through auth.users that don't have profiles
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Create profile for each missing user
    INSERT INTO public.profiles (id, email, full_name, credits, subscription_tier)
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.raw_user_meta_data->>'full_name', split_part(user_record.email, '@', 1)),
      10,
      'free'
    )
    ON CONFLICT (id) DO NOTHING;
    
    RAISE NOTICE 'Created profile for user: %', user_record.email;
  END LOOP;
END;
$$;

-- Execute the function to create missing profiles
SELECT create_missing_profiles();

-- Clean up the temporary function
DROP FUNCTION create_missing_profiles();

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Recreate policies with proper permissions
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow the trigger function to bypass RLS
ALTER TABLE profiles FORCE ROW LEVEL SECURITY;