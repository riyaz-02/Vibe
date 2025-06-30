import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabase';
import { StripeProduct } from '../stripe-config';

// Check if Stripe key is available and valid
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export interface StripeCheckoutOptions {
  priceId: string;
  mode: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
}

export interface UserSubscription {
  customer_id: string;
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
}

export interface UserOrder {
  customer_id: string;
  order_id: number;
  checkout_session_id: string;
  payment_intent_id: string;
  amount_subtotal: number;
  amount_total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  order_date: string;
}

export function useStripe() {
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const { user } = useAuth();

  const createCheckoutSession = async (options: StripeCheckoutOptions) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    if (!stripePromise) {
      throw new Error('Stripe is not configured. Please check your environment variables.');
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const defaultSuccessUrl = `${window.location.origin}/dashboard?success=true`;
      const defaultCancelUrl = `${window.location.origin}/plans?canceled=true`;

      const response = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: options.priceId,
          mode: options.mode,
          success_url: options.successUrl || defaultSuccessUrl,
          cancel_url: options.cancelUrl || defaultCancelUrl,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to create checkout session');
      }

      const { sessionId, url } = response.data;

      if (!url) {
        throw new Error('No checkout URL returned');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;

      return { sessionId, url };
    } catch (error: any) {
      console.error('Checkout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscription = async (): Promise<UserSubscription | null> => {
    if (!user || !supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }

      setSubscription(data);
      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  };

  const fetchUserOrders = async (): Promise<UserOrder[]> => {
    if (!user || !supabase) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      setOrders(data || []);
      return data || [];
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  };

  const cancelSubscription = async () => {
    if (!subscription?.subscription_id || !supabase) {
      throw new Error('No active subscription to cancel');
    }

    try {
      // This would typically call a Supabase function to cancel the subscription
      // For now, we'll just show that the functionality exists
      console.log('Canceling subscription:', subscription.subscription_id);
      
      // You would implement this by calling a Supabase function that uses the Stripe API
      // const response = await supabase.functions.invoke('cancel-subscription', {
      //   body: { subscription_id: subscription.subscription_id }
      // });
      
      throw new Error('Subscription cancellation not implemented yet');
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  };

  const purchaseProduct = async (product: StripeProduct) => {
    return createCheckoutSession({
      priceId: product.priceId,
      mode: product.mode,
      successUrl: `${window.location.origin}/success?success=true&product=${product.id}`,
      cancelUrl: `${window.location.origin}/plans?canceled=true&product=${product.id}`,
    });
  };

  return {
    loading,
    subscription,
    orders,
    createCheckoutSession,
    fetchUserSubscription,
    fetchUserOrders,
    cancelSubscription,
    purchaseProduct,
    stripeConfigured: !!stripePromise,
  };
}