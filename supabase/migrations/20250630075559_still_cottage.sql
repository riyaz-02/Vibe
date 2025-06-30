/*
  # Vibe Wallet System

  1. New Tables
    - `wallets` - User wallet balances
    - `wallet_transactions` - All wallet transaction history
    - `loan_repayments` - Loan repayment records
    
  2. Security
    - Enable RLS on all tables
    - Add policies for users to manage their own wallets
    - Add policies for loan participants to view repayments
    
  3. Functions
    - Wallet balance management
    - Automatic transaction logging
    - Platform fee calculation
*/

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  balance numeric(12,2) DEFAULT 0.00 NOT NULL CHECK (balance >= 0),
  currency text DEFAULT 'INR' NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, currency)
);

-- Create wallet transactions table
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid REFERENCES wallets(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  balance_before numeric(12,2) NOT NULL,
  balance_after numeric(12,2) NOT NULL,
  description text NOT NULL,
  reference_type text CHECK (reference_type IN ('stripe_payment', 'loan_funding', 'loan_repayment', 'platform_fee', 'withdrawal')),
  reference_id text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create loan repayments table
CREATE TABLE IF NOT EXISTS loan_repayments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loan_requests(id) ON DELETE CASCADE NOT NULL,
  borrower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  lender_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  repayment_amount numeric(12,2) NOT NULL CHECK (repayment_amount > 0),
  platform_fee numeric(12,2) NOT NULL DEFAULT 0 CHECK (platform_fee >= 0),
  net_amount_to_lender numeric(12,2) NOT NULL CHECK (net_amount_to_lender > 0),
  transaction_id uuid REFERENCES wallet_transactions(id),
  status text DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  repaid_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;

-- Wallet policies
CREATE POLICY "Users can view own wallet"
  ON wallets FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own wallet"
  ON wallets FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert wallets"
  ON wallets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Wallet transaction policies
CREATE POLICY "Users can view own transactions"
  ON wallet_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert transactions"
  ON wallet_transactions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Loan repayment policies
CREATE POLICY "Loan participants can view repayments"
  ON loan_repayments FOR SELECT
  TO authenticated
  USING (borrower_id = auth.uid() OR lender_id = auth.uid());

CREATE POLICY "Borrowers can create repayments"
  ON loan_repayments FOR INSERT
  TO authenticated
  WITH CHECK (borrower_id = auth.uid());

-- Function to update wallet balance
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE wallets 
  SET 
    balance = NEW.balance_after,
    updated_at = now()
  WHERE id = NEW.wallet_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update wallet balance after transaction
CREATE TRIGGER update_wallet_balance_trigger
  AFTER INSERT ON wallet_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_wallet_balance();

-- Function to create wallet for new users
CREATE OR REPLACE FUNCTION create_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO wallets (user_id, balance, currency)
  VALUES (NEW.id, 0.00, 'INR')
  ON CONFLICT (user_id, currency) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create wallet for new profiles
CREATE TRIGGER create_user_wallet_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_wallet();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_id ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created_at ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan_id ON loan_repayments(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_borrower_id ON loan_repayments(borrower_id);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_lender_id ON loan_repayments(lender_id);