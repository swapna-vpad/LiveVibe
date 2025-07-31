/*
  # Create Workflow Functions for AI Showcase Studio

  1. Functions
    - `get_user_ai_usage` - Get current month AI usage for user
    - `increment_ai_usage` - Increment AI usage counter
    - `check_ai_limit` - Check if user can generate more AI content
    - `get_user_subscription` - Get active user subscription details

  2. Triggers
    - Auto-increment usage when AI project is created
    - Auto-update project status based on Kling API responses
*/

-- Function to get user's current AI usage
CREATE OR REPLACE FUNCTION get_user_ai_usage(user_uuid uuid)
RETURNS TABLE(
  generations_used integer,
  plan_limit integer,
  can_generate boolean
) AS $$
DECLARE
  current_month text := to_char(now(), 'YYYY-MM');
  usage_record record;
  subscription_record record;
BEGIN
  -- Get current subscription
  SELECT sp.ai_generations INTO subscription_record
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND us.current_period_end > now()
  ORDER BY us.created_at DESC
  LIMIT 1;

  -- Default to free tier if no subscription
  IF subscription_record IS NULL THEN
    subscription_record.ai_generations := 1;
  END IF;

  -- Get or create usage record
  SELECT * INTO usage_record
  FROM ai_generations_usage
  WHERE user_id = user_uuid AND month_year = current_month;

  IF usage_record IS NULL THEN
    INSERT INTO ai_generations_usage (user_id, month_year, generations_used, plan_limit)
    VALUES (user_uuid, current_month, 0, subscription_record.ai_generations)
    RETURNING * INTO usage_record;
  END IF;

  -- Return usage information
  RETURN QUERY SELECT 
    usage_record.generations_used,
    usage_record.plan_limit,
    (usage_record.plan_limit = -1 OR usage_record.generations_used < usage_record.plan_limit) as can_generate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(user_uuid uuid)
RETURNS boolean AS $$
DECLARE
  current_month text := to_char(now(), 'YYYY-MM');
  can_generate boolean;
BEGIN
  -- Check if user can generate
  SELECT get_user_ai_usage.can_generate INTO can_generate
  FROM get_user_ai_usage(user_uuid);

  IF NOT can_generate THEN
    RETURN false;
  END IF;

  -- Increment usage
  INSERT INTO ai_generations_usage (user_id, month_year, generations_used, plan_limit)
  VALUES (user_uuid, current_month, 1, 1)
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    generations_used = ai_generations_usage.generations_used + 1,
    updated_at = now();

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user subscription details
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid uuid)
RETURNS TABLE(
  subscription_id uuid,
  plan_name text,
  plan_tier text,
  ai_generations integer,
  commission_rate numeric,
  status text,
  current_period_end timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.id,
    sp.name,
    sp.tier,
    sp.ai_generations,
    sp.commission_rate,
    us.status,
    us.current_period_end
  FROM user_subscriptions us
  JOIN subscription_plans sp ON us.plan_id = sp.id
  WHERE us.user_id = user_uuid 
    AND us.status = 'active'
    AND us.current_period_end > now()
  ORDER BY us.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update project status with error handling
CREATE OR REPLACE FUNCTION update_project_status(
  project_uuid uuid,
  new_status text,
  error_msg text DEFAULT NULL,
  video_url text DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  UPDATE ai_projects 
  SET 
    status = new_status,
    error_message = COALESCE(error_msg, error_message),
    output_video_url = COALESCE(video_url, output_video_url),
    completed_at = CASE WHEN new_status = 'completed' THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE id = project_uuid;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to auto-increment usage when project is created
CREATE OR REPLACE FUNCTION auto_increment_ai_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment for new projects that are processing
  IF NEW.status = 'processing' AND (OLD IS NULL OR OLD.status != 'processing') THEN
    PERFORM increment_ai_usage(NEW.user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-incrementing usage
DROP TRIGGER IF EXISTS trigger_auto_increment_ai_usage ON ai_projects;
CREATE TRIGGER trigger_auto_increment_ai_usage
  AFTER INSERT OR UPDATE ON ai_projects
  FOR EACH ROW
  EXECUTE FUNCTION auto_increment_ai_usage();

-- Function to clean up old usage records (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_usage_records()
RETURNS void AS $$
BEGIN
  DELETE FROM ai_generations_usage 
  WHERE created_at < now() - interval '12 months';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;