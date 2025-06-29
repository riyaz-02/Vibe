import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const body = await request.text()
  
  let receivedEvent
  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error(`Webhook signature verification failed.`, err.message)
    return new Response(err.message, { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  console.log(`🔔 Event received: ${receivedEvent.type}`)

  try {
    switch (receivedEvent.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = receivedEvent.data.object
        
        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'succeeded' })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        // Create notification for user
        const userId = paymentIntent.metadata.supabase_user_id
        if (userId) {
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'payment_success',
            title: 'Payment Successful',
            message: `Your payment for ${paymentIntent.metadata.product_name} was successful!`,
          })
        }
        break

      case 'payment_intent.payment_failed':
        const failedPayment = receivedEvent.data.object
        
        // Update order status
        await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', failedPayment.id)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = receivedEvent.data.object
        
        // Get user ID from customer
        const { data: customer } = await supabase
          .from('customers')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single()

        if (customer) {
          await supabase
            .from('subscriptions')
            .upsert({
              user_id: customer.user_id,
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              price_id: subscription.items.data[0].price.id,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
        }
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = receivedEvent.data.object
        
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', deletedSubscription.id)
        break

      default:
        console.log(`Unhandled event type: ${receivedEvent.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})