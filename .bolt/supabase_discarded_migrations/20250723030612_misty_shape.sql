/*
  # Add Kling AI integration fields to ai_projects table

  1. New Fields
    - `kling_task_id` (text) - Stores the Kling AI task ID for tracking
    - `error_message` (text) - Stores error messages if generation fails
  
  2. Changes
    - Add fields to support Kling AI video generation workflow
    - Allow tracking of external AI service task IDs
*/

-- Add Kling AI integration fields
ALTER TABLE ai_projects 
ADD COLUMN IF NOT EXISTS kling_task_id text,
ADD COLUMN IF NOT EXISTS error_message text;

-- Add index for faster lookups by task ID
CREATE INDEX IF NOT EXISTS idx_ai_projects_kling_task_id ON ai_projects(kling_task_id);