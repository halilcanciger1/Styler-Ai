/*
  # Fix Generation Table Triggers

  This migration fixes the database triggers that are causing the "record 'new' has no field 'user_id'" error.
  
  1. Drop and recreate problematic triggers and functions
  2. Ensure all trigger functions properly handle the NEW record structure
  3. Update any functions that incorrectly reference user_id in the NEW context

  ## Changes Made
  - Drop existing trigger functions that may be corrupted
  - Recreate trigger functions with proper field references
  - Ensure triggers work with current table schema
*/

-- Drop existing triggers first
DROP TRIGGER IF EXISTS update_generation_count ON public.generations;
DROP TRIGGER IF EXISTS update_generations_updated_at ON public.generations;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_generation_stats();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Recreate the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate the update_generation_stats function
CREATE OR REPLACE FUNCTION update_generation_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the total_generations count in profiles table
    UPDATE profiles 
    SET total_generations = total_generations + 1
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate triggers
CREATE TRIGGER update_generations_updated_at
    BEFORE UPDATE ON public.generations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_generation_count
    AFTER INSERT ON public.generations
    FOR EACH ROW
    EXECUTE FUNCTION update_generation_stats();

-- Also recreate the credit transaction function if it exists
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
            NEW.id,
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

-- Recreate the credit transaction trigger on profiles table
DROP TRIGGER IF EXISTS generation_credit_transaction ON public.profiles;
CREATE TRIGGER generation_credit_transaction
    AFTER UPDATE OF credits ON public.profiles
    FOR EACH ROW
    WHEN (OLD.credits > NEW.credits)
    EXECUTE FUNCTION handle_credit_transaction();

-- Create a new user handler function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Create default user preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for new user signup (on auth.users table)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();