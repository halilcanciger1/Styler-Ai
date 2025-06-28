/*
  # Fix Database Triggers and Functions

  1. Issues Fixed
    - Fix trigger functions that reference non-existent fields
    - Properly handle CASCADE drops for shared functions
    - Recreate all dependent triggers correctly
    - Ensure proper field references in trigger contexts

  2. Changes
    - Drop all dependent triggers first
    - Drop and recreate shared functions
    - Recreate all triggers with correct function references
    - Fix credit transaction handling
    - Ensure user creation works properly
*/

-- Drop all triggers that depend on update_updated_at_column first
DROP TRIGGER IF EXISTS update_generation_count ON public.generations;
DROP TRIGGER IF EXISTS update_generations_updated_at ON public.generations;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON public.user_preferences;
DROP TRIGGER IF EXISTS update_templates_updated_at ON public.templates;
DROP TRIGGER IF EXISTS generation_credit_transaction ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Now safely drop the functions
DROP FUNCTION IF EXISTS update_generation_stats();
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS handle_credit_transaction();
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the update_generation_stats function with proper field checking
CREATE OR REPLACE FUNCTION update_generation_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if user_id exists in the NEW record
    IF NEW.user_id IS NOT NULL THEN
        UPDATE profiles 
        SET total_generations = total_generations + 1
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the credit transaction function with proper field references
CREATE OR REPLACE FUNCTION handle_credit_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create transaction record if credits decreased
    IF OLD.credits > NEW.credits THEN
        INSERT INTO credits_transactions (
            user_id,
            transaction_type,
            amount,
            balance_before,
            balance_after,
            description
        ) VALUES (
            NEW.id,  -- This is the user's profile id
            'debit',
            OLD.credits - NEW.credits,
            OLD.credits,
            NEW.credits,
            'Credit used for generation'
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the new user handler function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
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
    
    -- Create default user preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the auth process
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate all triggers in the correct order

-- Triggers for generations table
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON public.generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generation_count
    AFTER INSERT ON public.generations
    FOR EACH ROW
    EXECUTE FUNCTION update_generation_stats();

-- Triggers for profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER generation_credit_transaction
    AFTER UPDATE OF credits ON public.profiles
    FOR EACH ROW
    WHEN (OLD.credits > NEW.credits)
    EXECUTE FUNCTION handle_credit_transaction();

-- Triggers for subscriptions table
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for user_preferences table
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers for templates table
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON public.templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for new user creation (on auth.users table)
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions for the trigger functions
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.profiles TO supabase_auth_admin;
GRANT ALL ON public.user_preferences TO supabase_auth_admin;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO supabase_auth_admin;