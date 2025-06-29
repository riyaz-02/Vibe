/*
  # Add document verification system

  1. New Tables
    - `document_verifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `document_type` (text)
      - `verification_status` (text)
      - `confidence_score` (decimal)
      - `extracted_data` (jsonb)
      - `verified_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `document_verifications` table
    - Add policies for users to read their own verifications
    - Add policy for system to insert verifications
*/

-- Create document verifications table
CREATE TABLE IF NOT EXISTS document_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('government_id', 'medical_prescription', 'supporting_document')),
  verification_status text NOT NULL CHECK (verification_status IN ('pending', 'verified', 'rejected', 'expired')),
  confidence_score decimal(3,2) DEFAULT 0.00,
  extracted_data jsonb,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE document_verifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own document verifications"
  ON document_verifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert document verifications"
  ON document_verifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own document verifications"
  ON document_verifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add verification status to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS identity_verified boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS identity_verified_at timestamptz;

-- Function to update profile verification status
CREATE OR REPLACE FUNCTION update_profile_verification()
RETURNS trigger AS $$
BEGIN
  IF NEW.document_type = 'government_id' AND NEW.verification_status = 'verified' THEN
    UPDATE profiles 
    SET 
      identity_verified = true,
      identity_verified_at = NEW.verified_at,
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile verification updates
DROP TRIGGER IF EXISTS on_document_verified ON document_verifications;
CREATE TRIGGER on_document_verified
  AFTER INSERT OR UPDATE ON document_verifications
  FOR EACH ROW EXECUTE FUNCTION update_profile_verification();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_document_verifications_user_id ON document_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_document_verifications_type ON document_verifications(document_type);
CREATE INDEX IF NOT EXISTS idx_document_verifications_status ON document_verifications(verification_status);