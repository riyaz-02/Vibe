import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user } = await supabase.auth.getUser(token)

    if (!user.user) {
      throw new Error('User not authenticated')
    }

    const { paymentIntentId, amount } = await req.json()

    // Get or create user wallet
    let { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('currency', 'INR')
      .single()

    if (!wallet) {
      const { data: newWallet, error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: user.user.id,
          balance: 0,
          currency: 'INR'
        })
        .select()
        .single()

      if (walletError) throw walletError
      wallet = newWallet
    }

    const balanceBefore = parseFloat(wallet.balance)
    const balanceAfter = balanceBefore + amount

    // Create wallet transaction
    const { error: transactionError } = await supabase
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        user_id: user.user.id,
        transaction_type: 'credit',
        amount: amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description: `Wallet top-up via Stripe - ₹${amount}`,
        reference_type: 'stripe_payment',
        reference_id: paymentIntentId,
        metadata: {
          payment_method: 'stripe',
          payment_intent_id: paymentIntentId
        }
      })

    if (transactionError) throw transactionError

    return new Response(
      JSON.stringify({
        success: true,
        newBalance: balanceAfter,
        transaction: {
          amount,
          balanceBefore,
          balanceAfter,
          description: `Wallet top-up via Stripe - ₹${amount}`
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Process wallet payment error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})