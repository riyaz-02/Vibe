import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user } = await supabase.auth.getUser(token)

    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { amount, currency = 'inr' } = await req.json()

    if (!amount || amount < 100) {
      throw new Error('Minimum amount is ₹100')
    }

    // Create or get customer
    let { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', user.user.id)
      .single()

    if (!customer) {
      const stripeCustomer = await stripe.customers.create({
        email: user.user.email,
        metadata: {
          supabase_user_id: user.user.id,
        },
      })

      await supabase.from('customers').insert({
        user_id: user.user.id,
        stripe_customer_id: stripeCustomer.id,
      })

      customer = { stripe_customer_id: stripeCustomer.id }
    }

    // Create payment intent for wallet top-up
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      customer: customer.stripe_customer_id,
      metadata: {
        supabase_user_id: user.user.id,
        purpose: 'wallet_topup',
        wallet_amount: amount.toString(),
      },
      description: `Vibe Wallet Top-up - ₹${amount}`,
    })

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Wallet funding error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})