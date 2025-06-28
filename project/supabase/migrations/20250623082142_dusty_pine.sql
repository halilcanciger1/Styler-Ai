/*
  # Fix profiles table RLS policy for signup

  1. Security Updates
    - Update INSERT policy for profiles table to allow proper signup flow
    - Ensure users can create their own profile during registration
    - Maintain security by only allowing users to create profiles with their own user ID

  2. Changes
    - Drop existing INSERT policy that may be too restrictive
    - Create new INSERT policy that works with the signup flow
    - Ensure the policy allows authenticated users to insert their own profile
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new INSERT policy that allows users to create their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Ensure the SELECT policy exists and works correctly
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Ensure the UPDATE policy exists and works correctly
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);