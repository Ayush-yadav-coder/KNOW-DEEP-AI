-- Drop the existing SELECT policy for feedback table
DROP POLICY IF EXISTS "Users can view their own feedback" ON feedback;

-- Create an explicit SELECT policy that properly handles NULL user_ids
-- This makes the intent clear: only authenticated users can see their own feedback
-- Anonymous feedback (user_id = NULL) is not readable by anyone
CREATE POLICY "Users can view their own feedback" 
ON feedback 
FOR SELECT 
USING (user_id IS NOT NULL AND auth.uid() = user_id);