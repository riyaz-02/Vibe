-- Create a function to handle the loan funding transaction
CREATE OR REPLACE FUNCTION fund_loan(
  p_loan_id UUID,
  p_lender_id UUID,
  p_borrower_id UUID,
  p_amount NUMERIC,
  p_platform_fee NUMERIC,
  p_net_amount NUMERIC
) RETURNS VOID AS $$
DECLARE
  v_lender_wallet_id UUID;
  v_borrower_wallet_id UUID;
  v_lender_balance NUMERIC;
  v_borrower_balance NUMERIC;
  v_new_total_funded NUMERIC;
  v_loan_status TEXT;
  v_loan_amount NUMERIC;
BEGIN
  -- Get lender wallet
  SELECT id, balance INTO v_lender_wallet_id, v_lender_balance
  FROM wallets
  WHERE user_id = p_lender_id AND currency = 'INR';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lender wallet not found';
  END IF;
  
  -- Check lender balance
  IF v_lender_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;
  
  -- Get borrower wallet
  SELECT id, balance INTO v_borrower_wallet_id, v_borrower_balance
  FROM wallets
  WHERE user_id = p_borrower_id AND currency = 'INR';
  
  IF NOT FOUND THEN
    -- Create borrower wallet if it doesn't exist
    INSERT INTO wallets (user_id, balance, currency)
    VALUES (p_borrower_id, 0, 'INR')
    RETURNING id, balance INTO v_borrower_wallet_id, v_borrower_balance;
  END IF;
  
  -- Get loan details
  SELECT total_funded, amount INTO v_new_total_funded, v_loan_amount
  FROM loan_requests
  WHERE id = p_loan_id;
  
  -- Update total funded amount
  v_new_total_funded := v_new_total_funded + p_amount;
  
  -- Determine if loan is now fully funded
  IF v_new_total_funded >= v_loan_amount THEN
    v_loan_status := 'funded';
  ELSE
    v_loan_status := 'active';
  END IF;
  
  -- Begin transaction
  BEGIN
    -- 1. Deduct from lender wallet
    UPDATE wallets
    SET balance = balance - p_amount
    WHERE id = v_lender_wallet_id;
    
    -- 2. Add to borrower wallet
    UPDATE wallets
    SET balance = balance + p_net_amount
    WHERE id = v_borrower_wallet_id;
    
    -- 3. Create lender transaction record
    INSERT INTO wallet_transactions (
      wallet_id,
      user_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description,
      reference_type,
      reference_id,
      metadata
    ) VALUES (
      v_lender_wallet_id,
      p_lender_id,
      'debit',
      p_amount,
      v_lender_balance,
      v_lender_balance - p_amount,
      'Loan funding - ' || p_loan_id,
      'loan_funding',
      p_loan_id,
      jsonb_build_object(
        'loan_id', p_loan_id,
        'borrower_id', p_borrower_id,
        'platform_fee', p_platform_fee
      )
    );
    
    -- 4. Create borrower transaction record
    INSERT INTO wallet_transactions (
      wallet_id,
      user_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description,
      reference_type,
      reference_id,
      metadata
    ) VALUES (
      v_borrower_wallet_id,
      p_borrower_id,
      'credit',
      p_net_amount,
      v_borrower_balance,
      v_borrower_balance + p_net_amount,
      'Loan received - ' || p_loan_id,
      'loan_funding',
      p_loan_id,
      jsonb_build_object(
        'loan_id', p_loan_id,
        'lender_id', p_lender_id,
        'platform_fee', p_platform_fee,
        'gross_amount', p_amount
      )
    );
    
    -- 5. Create loan funding record
    INSERT INTO loan_fundings (
      loan_id,
      lender_id,
      amount
    ) VALUES (
      p_loan_id,
      p_lender_id,
      p_amount
    );
    
    -- 6. Update loan request
    UPDATE loan_requests
    SET 
      total_funded = v_new_total_funded,
      status = v_loan_status,
      updated_at = now()
    WHERE id = p_loan_id;
    
    -- 7. Create notification for borrower
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      is_read
    ) VALUES (
      p_borrower_id,
      'loan_funded',
      'Loan Funded',
      'Your loan request has received funding of ' || p_net_amount || ' INR',
      false
    );
    
    -- 8. Create notification for lender
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      is_read
    ) VALUES (
      p_lender_id,
      'loan_funded',
      'Loan Funded',
      'You have successfully funded a loan with ' || p_amount || ' INR',
      false
    );
    
  END;
END;
$$ LANGUAGE plpgsql;