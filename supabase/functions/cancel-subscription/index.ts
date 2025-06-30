import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { subscription_id } = await req.json();

    if (!subscription_id) {
      return corsResponse({ error: 'Subscription ID is required' }, 400);
    }

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError) {
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    if (!user) {
      return corsResponse({ error: 'User not found' }, 404);
    }

    // Verify the subscription belongs to the user
    const { data: subscription, error: getSubscriptionError } = await supabase
      .from('stripe_subscriptions')
      .select('customer_id, subscription_id')
      .eq('subscription_id', subscription_id)
      .single();

    if (getSubscriptionError || !subscription) {
      return corsResponse({ error: 'Subscription not found' }, 404);
    }

    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', subscription.customer_id)
      .single();

    if (getCustomerError || !customer) {
      return corsResponse({ error: 'Customer not found' }, 404);
    }

    if (customer.user_id !== user.id) {
      return corsResponse({ error: 'Unauthorized' }, 403);
    }

    // Cancel the subscription at period end
    const canceledSubscription = await stripe.subscriptions.update(subscription_id, {
      cancel_at_period_end: true,
    });

    // Update the subscription in the database
    await supabase
      .from('stripe_subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('subscription_id', subscription_id);

    return corsResponse({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      cancel_at_period_end: true,
      current_period_end: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return corsResponse({ error: error.message }, 500);
  }
});