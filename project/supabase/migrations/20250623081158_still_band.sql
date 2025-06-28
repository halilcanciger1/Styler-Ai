/*
  # Fix profiles table RLS policies for signup

  1. Security Updates
    - Update INSERT policy to allow users to create their own profile during signup
    - Ensure the policy correctly references auth.uid() for new user registration
  
  2. Changes
    - Modify the existing INSERT policy to properly handle signup flow
    - The policy should allow INSERT when the new row's id matches the authenticated user's id
*/

-- Drop the existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new INSERT policy that allows users to create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the profiles table has RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;