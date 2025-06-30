import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Initialize Stripe
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const { paymentIntentId, amount } = await req.json();

    if (!paymentIntentId) {
      throw new Error("Payment intent ID is required");
    }

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== "succeeded") {
      throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }

    // Verify payment intent belongs to the user
    const customerId = paymentIntent.customer;
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (customerError || !customer || customer.user_id !== user.id) {
      throw new Error("Payment verification failed");
    }

    // Get or create user wallet
    let { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .eq("currency", "INR")
      .single();

    if (walletError) {
      // Create wallet if it doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from("wallets")
        .insert({
          user_id: user.id,
          balance: 0,
          currency: "INR"
        })
        .select()
        .single();

      if (createError) throw createError;
      wallet = newWallet;
    }

    // Update wallet balance
    const balanceBefore = parseFloat(wallet.balance);
    const balanceAfter = balanceBefore + amount;

    // Create wallet transaction
    const { data: transaction, error: transactionError } = await supabase
      .from("wallet_transactions")
      .insert({
        wallet_id: wallet.id,
        user_id: user.id,
        transaction_type: "credit",
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Wallet top-up via Stripe - ₹${amount}`,
        reference_type: "stripe_payment",
        reference_id: paymentIntentId,
        metadata: {
          payment_method: "stripe",
          payment_intent_id: paymentIntentId
        }
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Update wallet balance
    const { error: updateError } = await supabase
      .from("wallets")
      .update({ balance: balanceAfter })
      .eq("id", wallet.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        newBalance: balanceAfter,
        transaction: {
          id: transaction.id,
          amount,
          balanceBefore,
          balanceAfter,
          description: transaction.description
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Process wallet payment error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});