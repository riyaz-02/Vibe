/*
  # Add loan agreements and legal documents system

  1. New Tables
    - `loan_agreements`
      - `id` (uuid, primary key)
      - `loan_id` (uuid, references loan_requests)
      - `borrower_id` (uuid, references profiles)
      - `lender_id` (uuid, references profiles, nullable for initial agreement)
      - `agreement_type` (text) - 'loan_request', 'sanction_letter', 'lending_proof'
      - `agreement_data` (jsonb) - contains all agreement details
      - `pdf_url` (text) - URL to generated PDF
      - `status` (text) - 'pending', 'signed', 'active', 'completed'
      - `signed_at` (timestamp)
      - `created_at` (timestamp)

    - `agreement_signatures`
      - `id` (uuid, primary key)
      - `agreement_id` (uuid, references loan_agreements)
      - `signer_id` (uuid, references profiles)
      - `signature_type` (text) - 'borrower', 'lender'
      - `ip_address` (text)
      - `user_agent` (text)
      - `signed_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to access their own agreements
*/

-- Create loan agreements table
CREATE TABLE IF NOT EXISTS loan_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loan_requests(id) ON DELETE CASCADE,
  borrower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  lender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  agreement_type text NOT NULL CHECK (agreement_type IN ('loan_request', 'sanction_letter', 'lending_proof')),
  agreement_data jsonb NOT NULL,
  pdf_url text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'signed', 'active', 'completed', 'cancelled')),
  signed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agreement signatures table
CREATE TABLE IF NOT EXISTS agreement_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid REFERENCES loan_agreements(id) ON DELETE CASCADE,
  signer_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  signature_type text NOT NULL CHECK (signature_type IN ('borrower', 'lender')),
  ip_address text,
  user_agent text,
  signed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE loan_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_signatures ENABLE ROW LEVEL SECURITY;

-- Loan agreements policies
CREATE POLICY "Users can read own loan agreements"
  ON loan_agreements
  FOR SELECT
  TO authenticated
  USING (borrower_id = auth.uid() OR lender_id = auth.uid());

CREATE POLICY "System can insert loan agreements"
  ON loan_agreements
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own loan agreements"
  ON loan_agreements
  FOR UPDATE
  TO authenticated
  USING (borrower_id = auth.uid() OR lender_id = auth.uid());

-- Agreement signatures policies
CREATE POLICY "Users can read own signatures"
  ON agreement_signatures
  FOR SELECT
  TO authenticated
  USING (signer_id = auth.uid());

CREATE POLICY "Users can insert own signatures"
  ON agreement_signatures
  FOR INSERT
  TO authenticated
  WITH CHECK (signer_id = auth.uid());

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_loan_agreements_loan_id ON loan_agreements(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_agreements_borrower_id ON loan_agreements(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loan_agreements_lender_id ON loan_agreements(lender_id);
CREATE INDEX IF NOT EXISTS idx_loan_agreements_type ON loan_agreements(agreement_type);
CREATE INDEX IF NOT EXISTS idx_agreement_signatures_agreement_id ON agreement_signatures(agreement_id);

-- Function to create sanction letter when loan is funded
CREATE OR REPLACE FUNCTION create_sanction_letter()
RETURNS trigger AS $$
DECLARE
  loan_data record;
  borrower_data record;
  lender_data record;
  agreement_data jsonb;
BEGIN
  -- Get loan details
  SELECT * INTO loan_data FROM loan_requests WHERE id = NEW.loan_id;
  
  -- Get borrower details
  SELECT * INTO borrower_data FROM profiles WHERE id = loan_data.borrower_id;
  
  -- Get lender details
  SELECT * INTO lender_data FROM profiles WHERE id = NEW.lender_id;
  
  -- Prepare agreement data
  agreement_data := jsonb_build_object(
    'loan_id', NEW.loan_id,
    'funding_id', NEW.id,
    'loan_amount', loan_data.amount,
    'funded_amount', NEW.amount,
    'interest_rate', loan_data.interest_rate,
    'tenure_days', loan_data.tenure_days,
    'purpose', loan_data.purpose,
    'borrower', jsonb_build_object(
      'id', borrower_data.id,
      'name', borrower_data.name,
      'email', borrower_data.email,
      'phone', borrower_data.phone
    ),
    'lender', jsonb_build_object(
      'id', lender_data.id,
      'name', lender_data.name,
      'email', lender_data.email,
      'phone', lender_data.phone
    ),
    'terms', jsonb_build_object(
      'repayment_date', (NEW.funded_at + (loan_data.tenure_days || ' days')::interval),
      'total_repayment', (NEW.amount * (1 + loan_data.interest_rate / 100.0 * loan_data.tenure_days / 365.0)),
      'late_fee_percentage', 2.0,
      'platform_fee_percentage', 1.5
    ),
    'created_at', NEW.funded_at
  );
  
  -- Create sanction letter agreement
  INSERT INTO loan_agreements (
    loan_id,
    borrower_id,
    lender_id,
    agreement_type,
    agreement_data,
    status
  ) VALUES (
    NEW.loan_id,
    loan_data.borrower_id,
    NEW.lender_id,
    'sanction_letter',
    agreement_data,
    'active'
  );
  
  -- Create lending proof agreement
  INSERT INTO loan_agreements (
    loan_id,
    borrower_id,
    lender_id,
    agreement_type,
    agreement_data,
    status
  ) VALUES (
    NEW.loan_id,
    loan_data.borrower_id,
    NEW.lender_id,
    'lending_proof',
    agreement_data,
    'active'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create agreements when loan is funded
DROP TRIGGER IF EXISTS on_loan_funded ON loan_fundings;
CREATE TRIGGER on_loan_funded
  AFTER INSERT ON loan_fundings
  FOR EACH ROW EXECUTE FUNCTION create_sanction_letter();