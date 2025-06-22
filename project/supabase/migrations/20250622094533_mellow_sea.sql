/*
  # Enhanced Schema for AI Fashion Platform with Workflow Integration

  1. New Tables
    - `workflow_executions` - Track n8n workflow runs
    - `generation_queue` - Queue system for processing
    - `user_preferences` - Store user settings and preferences
    - `templates` - Pre-built fashion templates
    - `credits_transactions` - Track credit usage history

  2. Enhanced Tables
    - Add workflow tracking to generations
    - Add metadata fields for better analytics
    - Add status tracking and error handling

  3. Security
    - Enable RLS on all new tables
    - Add comprehensive policies for data access
    - Add audit triggers for sensitive operations

  4. Performance
    - Add indexes for common queries
    - Add materialized views for analytics
    - Optimize for real-time updates
*/

-- Create workflow_executions table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  generation_id uuid REFERENCES generations(id) ON DELETE CASCADE,
  workflow_id text NOT NULL,
  execution_id text,
  status text DEFAULT 'pending',
  input_data jsonb,
  output_data jsonb,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create generation_queue table
CREATE TABLE IF NOT EXISTS generation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  generation_id uuid REFERENCES generations(id) ON DELETE CASCADE NOT NULL,
  priority integer DEFAULT 0,
  retry_count integer DEFAULT 0,
  max_retries integer DEFAULT 3,
  scheduled_at timestamptz DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  status text DEFAULT 'queued',
  error_message text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  default_quality text DEFAULT 'balanced',
  default_samples integer DEFAULT 1,
  auto_save_results boolean DEFAULT true,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT true,
  preferred_categories text[] DEFAULT ARRAY['tops'],
  ui_theme text DEFAULT 'light',
  language text DEFAULT 'en',
  timezone text DEFAULT 'UTC',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  model_image_url text NOT NULL,
  garment_image_url text NOT NULL,
  result_image_url text,
  tags text[] DEFAULT ARRAY[]::text[],
  is_public boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  usage_count integer DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create credits_transactions table
CREATE TABLE IF NOT EXISTS credits_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  generation_id uuid REFERENCES generations(id) ON DELETE SET NULL,
  transaction_type text NOT NULL, -- 'debit', 'credit', 'refund'
  amount integer NOT NULL,
  balance_before integer NOT NULL,
  balance_after integer NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add new columns to existing tables
DO $$
BEGIN
  -- Add workflow tracking to generations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generations' AND column_name = 'workflow_execution_id'
  ) THEN
    ALTER TABLE generations ADD COLUMN workflow_execution_id uuid REFERENCES workflow_executions(id);
  END IF;

  -- Add metadata to generations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generations' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE generations ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;

  -- Add error tracking to generations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generations' AND column_name = 'error_message'
  ) THEN
    ALTER TABLE generations ADD COLUMN error_message text;
  END IF;

  -- Add retry count to generations
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generations' AND column_name = 'retry_count'
  ) THEN
    ALTER TABLE generations ADD COLUMN retry_count integer DEFAULT 0;
  END IF;

  -- Add phone number to profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;

  -- Add last login to profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login_at timestamptz;
  END IF;

  -- Add total generations count to profiles
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'total_generations'
  ) THEN
    ALTER TABLE profiles ADD COLUMN total_generations integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow_executions
CREATE POLICY "Users can view own workflow executions"
  ON workflow_executions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workflow executions"
  ON workflow_executions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflow executions"
  ON workflow_executions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for generation_queue
CREATE POLICY "Users can view own queue items"
  ON generation_queue FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own queue items"
  ON generation_queue FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own queue items"
  ON generation_queue FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for templates
CREATE POLICY "Users can view public templates"
  ON templates FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can insert own templates"
  ON templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates"
  ON templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates"
  ON templates FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- Create policies for credits_transactions
CREATE POLICY "Users can view own transactions"
  ON credits_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions"
  ON credits_transactions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS workflow_executions_user_id_idx ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS workflow_executions_status_idx ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS generation_queue_user_id_idx ON generation_queue(user_id);
CREATE INDEX IF NOT EXISTS generation_queue_status_idx ON generation_queue(status);
CREATE INDEX IF NOT EXISTS generation_queue_priority_idx ON generation_queue(priority DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS templates_category_idx ON templates(category);
CREATE INDEX IF NOT EXISTS templates_public_idx ON templates(is_public);
CREATE INDEX IF NOT EXISTS credits_transactions_user_id_idx ON credits_transactions(user_id);
CREATE INDEX IF NOT EXISTS credits_transactions_type_idx ON credits_transactions(transaction_type);

-- Create triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle credit transactions
CREATE OR REPLACE FUNCTION handle_credit_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert transaction record
  INSERT INTO credits_transactions (
    user_id,
    generation_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description
  ) VALUES (
    NEW.user_id,
    NEW.id,
    'debit',
    1,
    OLD.credits,
    NEW.credits,
    'Generation credit used'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update generation stats
CREATE OR REPLACE FUNCTION update_generation_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total generations count
  UPDATE profiles 
  SET total_generations = total_generations + 1
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic stats updates
CREATE TRIGGER generation_credit_transaction
  AFTER UPDATE OF credits ON profiles
  FOR EACH ROW
  WHEN (OLD.credits > NEW.credits)
  EXECUTE FUNCTION handle_credit_transaction();

CREATE TRIGGER update_generation_count
  AFTER INSERT ON generations
  FOR EACH ROW
  EXECUTE FUNCTION update_generation_stats();

-- Create materialized view for analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS user_analytics AS
SELECT 
  p.id as user_id,
  p.email,
  p.subscription_tier,
  p.total_generations,
  p.credits,
  COUNT(g.id) as completed_generations,
  AVG(g.processing_time) as avg_processing_time,
  MAX(g.created_at) as last_generation_at,
  COUNT(DISTINCT DATE(g.created_at)) as active_days
FROM profiles p
LEFT JOIN generations g ON p.id = g.user_id AND g.status = 'completed'
GROUP BY p.id, p.email, p.subscription_tier, p.total_generations, p.credits;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS user_analytics_user_id_idx ON user_analytics(user_id);

-- Create function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_user_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_analytics;
END;
$$ LANGUAGE plpgsql;