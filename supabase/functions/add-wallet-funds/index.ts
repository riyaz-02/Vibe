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
    const { amount, currency = "inr" } = await req.json();

    if (!amount || amount < 100) {
      throw new Error("Minimum amount is ₹100");
    }

    // Ensure user profile exists
    let { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Profile check failed: ${profileError.message}`);
    }

    // Create profile if it doesn't exist
    if (!profile) {
      console.log("Creating profile for user:", user.id);
      const { data: newProfile, error: createProfileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          phone: user.user_metadata?.phone || null,
          avatar_url: user.user_metadata?.avatar_url || null,
          is_verified: false,
          language: 'en',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select("id")
        .single();

      if (createProfileError) {
        // If profile creation failed due to duplicate key (race condition), try to fetch again
        if (createProfileError.code === '23505') {
          const { data: existingProfile, error: refetchError } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

          if (refetchError) throw new Error(`Profile refetch failed: ${refetchError.message}`);
          profile = existingProfile;
        } else {
          throw new Error(`Profile creation failed: ${createProfileError.message}`);
        }
      } else {
        profile = newProfile;
      }
    }

    // Get or create Stripe customer
    let { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (customerError) {
      throw new Error(`Customer fetch failed: ${customerError.message}`);
    }

    if (!customer) {
      // Create new customer if not found
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      const { data: newCustomer, error: createCustomerError } = await supabase
        .from("customers")
        .insert({
          user_id: user.id,
          stripe_customer_id: stripeCustomer.id,
        })
        .select("stripe_customer_id")
        .single();

      if (createCustomerError) {
        throw new Error(`Customer creation failed: ${createCustomerError.message}`);
      }

      customer = newCustomer;
    }

    // Create payment intent for wallet top-up
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      customer: customer.stripe_customer_id,
      metadata: {
        supabase_user_id: user.id,
        purpose: "wallet_topup",
        wallet_amount: amount.toString(),
      },
      description: `Vibe Wallet Top-up - ₹${amount}`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Wallet funding error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});