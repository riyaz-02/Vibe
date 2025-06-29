/*
  # Create loan system tables

  1. New Tables
    - `loan_requests`
      - `id` (uuid, primary key)
      - `borrower_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `amount` (decimal)
      - `currency` (text, default 'INR')
      - `interest_rate` (decimal)
      - `tenure_days` (integer)
      - `purpose` (text)
      - `status` (text)
      - `total_funded` (decimal, default 0)
      - `images` (text array, optional)
      - `medical_verification` (jsonb, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `loan_fundings`
      - `id` (uuid, primary key)
      - `loan_id` (uuid, references loan_requests)
      - `lender_id` (uuid, references profiles)
      - `amount` (decimal)
      - `funded_at` (timestamp)

    - `loan_interactions`
      - `id` (uuid, primary key)
      - `loan_id` (uuid, references loan_requests)
      - `user_id` (uuid, references profiles)
      - `type` (text) -- 'like', 'comment', 'share'
      - `content` (text, optional for comments)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for loan management
*/

-- Create loan requests table
CREATE TABLE IF NOT EXISTS loan_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'INR',
  interest_rate decimal(5,2) NOT NULL CHECK (interest_rate >= 0),
  tenure_days integer NOT NULL CHECK (tenure_days > 0),
  purpose text NOT NULL CHECK (purpose IN ('education', 'medical', 'rent', 'emergency', 'textbooks', 'assistive-devices', 'other')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'funded', 'completed', 'defaulted', 'cancelled')),
  total_funded decimal(12,2) DEFAULT 0.00,
  images text[],
  medical_verification jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create loan fundings table
CREATE TABLE IF NOT EXISTS loan_fundings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loan_requests(id) ON DELETE CASCADE,
  lender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(12,2) NOT NULL CHECK (amount > 0),
  funded_at timestamptz DEFAULT now(),
  UNIQUE(loan_id, lender_id)
);

-- Create loan interactions table
CREATE TABLE IF NOT EXISTS loan_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loan_requests(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('like', 'comment', 'share')),
  content text,
  created_at timestamptz DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  category text NOT NULL CHECK (category IN ('borrower', 'lender', 'community')),
  earned_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('loan_funded', 'repayment_due', 'badge_earned', 'verification_complete')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_fundings ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Loan requests policies
CREATE POLICY "Anyone can read active loan requests"
  ON loan_requests
  FOR SELECT
  TO authenticated
  USING (status = 'active' OR borrower_id = auth.uid());

CREATE POLICY "Users can create own loan requests"
  ON loan_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = borrower_id);

CREATE POLICY "Users can update own loan requests"
  ON loan_requests
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = borrower_id);

-- Loan fundings policies
CREATE POLICY "Users can read loan fundings"
  ON loan_fundings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create loan fundings"
  ON loan_fundings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = lender_id);

-- Loan interactions policies
CREATE POLICY "Users can read loan interactions"
  ON loan_interactions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create loan interactions"
  ON loan_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interactions"
  ON loan_interactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Badges policies
CREATE POLICY "Users can read all badges"
  ON badges
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert badges"
  ON badges
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to update loan funding progress
CREATE OR REPLACE FUNCTION update_loan_funding()
RETURNS trigger AS $$
BEGIN
  UPDATE loan_requests 
  SET 
    total_funded = (
      SELECT COALESCE(SUM(amount), 0) 
      FROM loan_fundings 
      WHERE loan_id = NEW.loan_id
    ),
    status = CASE 
      WHEN (SELECT COALESCE(SUM(amount), 0) FROM loan_fundings WHERE loan_id = NEW.loan_id) >= amount THEN 'funded'
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.loan_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for loan funding updates
DROP TRIGGER IF EXISTS on_loan_funding_created ON loan_fundings;
CREATE TRIGGER on_loan_funding_created
  AFTER INSERT ON loan_fundings
  FOR EACH ROW EXECUTE FUNCTION update_loan_funding();