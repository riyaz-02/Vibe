import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const { loanId, repaymentAmount } = await req.json();

    // Get loan details
    const { data: loan, error: loanError } = await supabase
      .from("loan_requests")
      .select(`
        *,
        loan_fundings(
          lender_id,
          amount,
          profiles!lender_id(name, email)
        )
      `)
      .eq("id", loanId)
      .eq("borrower_id", user.id)
      .single();

    if (loanError || !loan) {
      throw new Error("Loan not found or unauthorized");
    }

    if (loan.status !== "funded" && loan.status !== "active") {
      throw new Error("Loan is not in a repayable status");
    }

    // Get borrower wallet
    const { data: borrowerWallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .eq("currency", "INR")
      .single();

    if (walletError || !borrowerWallet) {
      throw new Error("Borrower wallet not found");
    }

    if (parseFloat(borrowerWallet.balance) < repaymentAmount) {
      throw new Error("Insufficient wallet balance");
    }

    // Calculate platform fee as 4.5% of principal amount
    const platformFeePercentage = 4.5;
    const principal = loan.total_funded;
    const platformFee = principal * (platformFeePercentage / 100);
    
    // Calculate interest portion of repayment
    const timeInYears = loan.tenure_days / 365;
    const interestAmount = principal * (loan.interest_rate / 100) * timeInYears;
    
    const netAmountToLender = repaymentAmount - platformFee;

    console.log(`Loan repayment calculation:
      Principal: ${principal}
      Interest Rate: ${loan.interest_rate}%
      Interest Amount: ${interestAmount}
      Platform Fee Percentage: ${platformFeePercentage}% of principal
      Platform Fee: ${platformFee}
      Net to Lender: ${netAmountToLender}
    `);

    // Process repayment for each lender
    const repaymentPromises = loan.loan_fundings.map(async (funding: any) => {
      const lenderShare = (funding.amount / loan.amount) * netAmountToLender;
      
      // Get lender wallet
      let { data: lenderWallet, error: lenderWalletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", funding.lender_id)
        .eq("currency", "INR")
        .single();

      if (lenderWalletError) {
        // Create lender wallet if doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from("wallets")
          .insert({
            user_id: funding.lender_id,
            balance: 0,
            currency: "INR"
          })
          .select()
          .single();

        if (createError) throw createError;
        lenderWallet = newWallet;
      }

      // Credit lender wallet
      const lenderBalanceBefore = parseFloat(lenderWallet.balance);
      const lenderBalanceAfter = lenderBalanceBefore + lenderShare;

      const { data: lenderTransaction, error: lenderTransactionError } = await supabase
        .from("wallet_transactions")
        .insert({
          wallet_id: lenderWallet.id,
          user_id: funding.lender_id,
          transaction_type: "credit",
          amount: lenderShare,
          balance_before: lenderBalanceBefore,
          balance_after: lenderBalanceAfter,
          description: `Loan repayment received - ₹${lenderShare.toFixed(2)}`,
          reference_type: "loan_repayment",
          reference_id: loanId,
          metadata: {
            loan_id: loanId,
            borrower_id: user.id,
            original_funding: funding.amount
          }
        })
        .select()
        .single();

      if (lenderTransactionError) throw lenderTransactionError;

      // Update lender wallet balance
      const { error: updateLenderError } = await supabase
        .from("wallets")
        .update({ balance: lenderBalanceAfter })
        .eq("id", lenderWallet.id);

      if (updateLenderError) throw updateLenderError;

      return {
        lender_id: funding.lender_id,
        lender_name: funding.profiles?.name,
        lender_email: funding.profiles?.email,
        amount: lenderShare
      };
    });

    const lenderPayments = await Promise.all(repaymentPromises);

    // Debit borrower wallet
    const borrowerBalanceBefore = parseFloat(borrowerWallet.balance);
    const borrowerBalanceAfter = borrowerBalanceBefore - repaymentAmount;

    const { data: borrowerTransaction, error: borrowerTransactionError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: borrowerWallet.id,
        user_id: user.id,
        transaction_type: "debit",
        amount: repaymentAmount,
        balance_before: borrowerBalanceBefore,
        balance_after: borrowerBalanceAfter,
        description: `Loan repayment - ₹${repaymentAmount}`,
        reference_type: "loan_repayment",
        reference_id: loanId,
        metadata: {
          loan_id: loanId,
          platform_fee: platformFee,
          platform_fee_percentage: platformFeePercentage,
          interest_amount: interestAmount,
          net_to_lenders: netAmountToLender
        }
      })
      .select()
      .single();

    if (borrowerTransactionError) throw borrowerTransactionError;

    // Update borrower wallet balance
    const { error: updateBorrowerError } = await supabase
      .from("wallets")
      .update({ balance: borrowerBalanceAfter })
      .eq("id", borrowerWallet.id);

    if (updateBorrowerError) throw updateBorrowerError;

    // Get borrower profile
    const { data: borrowerProfile, error: borrowerProfileError } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", user.id)
      .maybeSingle();

    if (borrowerProfileError) {
      console.error("Error fetching borrower profile:", borrowerProfileError);
    }

    // Record loan repayment
    const { data: repaymentRecord, error: repaymentError } = await supabase
      .from("loan_repayments")
      .insert({
        loan_id: loanId,
        borrower_id: user.id,
        lender_id: loan.loan_fundings[0].lender_id, // Primary lender
        repayment_amount: repaymentAmount,
        platform_fee: platformFee,
        net_amount_to_lender: netAmountToLender,
        transaction_id: borrowerTransaction.id,
        status: "completed",
        repaid_at: new Date().toISOString()
      })
      .select()
      .single();

    if (repaymentError) throw repaymentError;

    // Update loan status to completed
    const { error: updateLoanError } = await supabase
      .from("loan_requests")
      .update({ 
        status: "completed",
        updated_at: new Date().toISOString()
      })
      .eq("id", loanId);

    if (updateLoanError) throw updateLoanError;

    // Create loan closure document
    const closureData = {
      loan_id: loanId,
      borrower_id: user.id,
      lender_id: loan.loan_fundings[0].lender_id,
      loan_amount: loan.amount,
      repayment_amount: repaymentAmount,
      interest_rate: loan.interest_rate,
      interest_amount: interestAmount,
      platform_fee: platformFee,
      platform_fee_percentage: platformFeePercentage,
      net_amount_to_lender: netAmountToLender,
      purpose: loan.purpose,
      created_at: loan.created_at,
      repaid_at: new Date().toISOString(),
      borrower: {
        name: borrowerProfile?.name || user.email?.split('@')[0] || 'Borrower',
        email: borrowerProfile?.email || user.email || ''
      },
      lender: {
        name: lenderPayments[0]?.lender_name || 'Lender',
        email: lenderPayments[0]?.lender_email || ''
      }
    };

    // Create loan closure agreement
    const { error: closureError } = await supabase
      .from("loan_agreements")
      .insert({
        loan_id: loanId,
        borrower_id: user.id,
        lender_id: loan.loan_fundings[0].lender_id,
        agreement_type: "loan_closure",
        agreement_data: closureData,
        status: "completed",
        signed_at: new Date().toISOString()
      });

    if (closureError) {
      console.error("Error creating loan closure document:", closureError);
      // Continue with the process even if closure document creation fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        repaymentAmount,
        platformFee,
        platformFeePercentage,
        interestAmount,
        netAmountToLender,
        newBorrowerBalance: borrowerBalanceAfter,
        lenderPayments,
        closureDocumentCreated: !closureError
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Loan repayment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});