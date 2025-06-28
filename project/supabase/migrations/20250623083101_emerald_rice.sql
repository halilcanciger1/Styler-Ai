/*
  # Create automatic profile creation trigger

  1. Function to handle new user creation
    - Automatically creates a profile when a user signs up
    - Uses the auth.users data to populate the profile
    - Handles the timing issue with RLS policies

  2. Trigger
    - Fires when a new user is inserted into auth.users
    - Calls the function to create the corresponding profile

  3. Security
    - Uses SECURITY DEFINER to bypass RLS during profile creation
    - Ensures profiles are created with correct user data
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;