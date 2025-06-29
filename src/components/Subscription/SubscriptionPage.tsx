import React, { useState, useEffect } from 'react';
import { Crown, Check, Loader2, Star, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { stripeProducts } from '../../stripe-config';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Subscription {
  subscription_status: string;
  price_id: string | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
}

const SubscriptionPage: React.FC = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('subscription_status, price_id, current_period_end, cancel_at_period_end')
        .maybeSingle();

      if (error) {
        console.error('Error fetching subscription:', error);
        toast.error('Failed to load subscription data');
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast.error('Failed to load subscription data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    setIsCheckingOut(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please log in to subscribe');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/subscription/success`,
          cancel_url: `${window.location.origin}/subscription`,
          mode: 'subscription'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to start checkout process');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const isActiveSubscription = subscription?.subscription_status === 'active';
  const currentProduct = subscription?.price_id 
    ? stripeProducts.find(p => p.priceId === subscription.price_id)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="animate-spin text-blue-500" size={24} />
          <span className="text-gray-600">Loading subscription data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Crown className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock premium features and enhance your lending experience with our subscription plans
          </p>
        </motion.div>

        {/* Current Subscription Status */}
        {isActiveSubscription && currentProduct && (
          <motion.div
            className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">
                  Active Subscription: {currentProduct.name}
                </h3>
                <p className="text-green-700">
                  {subscription.current_period_end && (
                    <>
                      {subscription.cancel_at_period_end 
                        ? 'Expires on ' 
                        : 'Renews on '
                      }
                      {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <motion.div
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-gray-900 mb-2">₹0</div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center space-x-3">
                <Check className="text-green-500" size={20} />
                <span>Basic lending and borrowing</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="text-green-500" size={20} />
                <span>Community support</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="text-green-500" size={20} />
                <span>Standard verification</span>
              </li>
              <li className="flex items-center space-x-3">
                <Check className="text-green-500" size={20} />
                <span>Basic analytics</span>
              </li>
            </ul>

            <button
              disabled
              className="w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg font-medium cursor-not-allowed"
            >
              Current Plan
            </button>
          </motion.div>

          {/* Premium Plan */}
          {stripeProducts.map((product, index) => (
            <motion.div
              key={product.priceId}
              className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl shadow-xl text-white p-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              {/* Popular Badge */}
              <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium">
                Popular
              </div>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                <div className="text-4xl font-bold mb-2">$10</div>
                <p className="text-blue-100">Enhanced features for power users</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <Star className="text-yellow-400" size={20} />
                  <span>Priority loan matching</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Zap className="text-yellow-400" size={20} />
                  <span>Advanced analytics & insights</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Shield className="text-yellow-400" size={20} />
                  <span>Enhanced security features</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Crown className="text-yellow-400" size={20} />
                  <span>Premium support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-green-400" size={20} />
                  <span>Lower platform fees</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="text-green-400" size={20} />
                  <span>Early access to new features</span>
                </li>
              </ul>

              <button
                onClick={() => handleSubscribe(product.priceId)}
                disabled={isCheckingOut || (isActiveSubscription && currentProduct?.priceId === product.priceId)}
                className="w-full py-3 px-4 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </>
                ) : isActiveSubscription && currentProduct?.priceId === product.priceId ? (
                  <span>Current Plan</span>
                ) : (
                  <span>Subscribe Now</span>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Why Choose Premium?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="text-blue-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Faster Matching</h4>
              <p className="text-gray-600">Get priority placement in loan matching algorithms</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-green-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Enhanced Security</h4>
              <p className="text-gray-600">Advanced fraud protection and verification</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="text-purple-600" size={24} />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Premium Support</h4>
              <p className="text-gray-600">24/7 priority customer support</p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Questions about our plans?
          </h3>
          <p className="text-gray-600 mb-6">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <button className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors">
            Contact Support
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default SubscriptionPage;