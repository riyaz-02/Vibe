/*
  # Add unique constraint to badges table

  1. Changes
    - Add unique constraint on `user_id` and `name` columns in `badges` table
    - This enables proper upsert operations to prevent duplicate badges per user
    - Allows the application to use ON CONFLICT resolution for badge awarding

  2. Security
    - No changes to existing RLS policies
    - Maintains data integrity by preventing duplicate badges

  3. Notes
    - This constraint is required for the upsert operation in the Profile component
    - Ensures each user can only have one badge of each type
*/

-- Add unique constraint on user_id and name combination
ALTER TABLE badges ADD CONSTRAINT badges_user_id_name_unique UNIQUE (user_id, name);