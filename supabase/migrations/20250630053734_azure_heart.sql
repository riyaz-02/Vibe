/*
  # Fix badges RLS policy for system badge awarding

  1. Security Changes
    - Update badges RLS policies to allow system operations
    - Allow authenticated users to have badges inserted by the system
    - Maintain read access for all users

  2. Changes
    - Modify INSERT policy to allow system badge awarding
    - Keep existing SELECT policy for reading badges
*/

-- Drop existing policies
DROP POLICY IF EXISTS "System can insert badges" ON badges;
DROP POLICY IF EXISTS "Users can read all badges" ON badges;

-- Create new policies that allow system badge awarding
CREATE POLICY "System and users can insert badges"
  ON badges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can read all badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow updates for badge modifications
CREATE POLICY "System can update badges"
  ON badges
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);