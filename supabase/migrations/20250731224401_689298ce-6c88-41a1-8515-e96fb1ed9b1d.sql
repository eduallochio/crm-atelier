-- Fix RLS infinite recursion in profiles table
-- Remove the existing recursive policy
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;

-- Create a simpler, non-recursive policy for viewing profiles
CREATE POLICY "Users can view profiles in their organization" 
ON profiles FOR SELECT 
USING (
  -- Users can view their own profile
  id = auth.uid() 
  OR 
  -- Users can view profiles in the same organization
  organization_id = (
    SELECT organization_id 
    FROM profiles 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);