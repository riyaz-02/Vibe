import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, Crown, Package, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { getProductById } from '../../stripe-config';
import { useStripe } from '../../hooks/useStripe';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { fetchUserSubscription, fetchUserOrders } = useStripe();
  const [loading, setLoading] = useState(true);
  
  const success = searchParams.get('success');
  const productId = searchParams.get('product');
  const product = productId ? getProductById(productId) : null;

  useEffect(() => {
    if (success === 'true') {
      // Trigger confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Refresh user data
      const refreshData = async () => {
        setLoading(true);
        try {
          console.log('Refreshing subscription and order data...');
          await Promise.all([
            fetchUserSubscription(),
            fetchUserOrders()
          ]);
          console.log('Data refresh complete');
        } catch (error) {
          console.error('Error refreshing data:', error);
        } finally {
          setLoading(false);
        }
      };

      refreshData();
    } else {
      setLoading(false);
    }
  }, [success]);

  if (success !== 'true') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-center mb-6">
            <img 
              src="https://i.postimg.cc/3NkJPPCj/4310527d-e957-40f6-b9e8-eefdb06219f3-1.png" 
              alt="Vibe Logo" 
              className="h-16 w-auto"
            />
          </div>
          
          <motion.div
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <CheckCircle className="text-white" size={48} />
          </motion.div>

          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Payment Successful!
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Thank you for your purchase. Your payment has been processed successfully and you now have access to premium features.
          </p>

          {product && (
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8 max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center space-x-3 mb-4">
                {product.mode === 'subscription' ? (
                  <Crown className="text-yellow-500" size={24} />
                ) : (
                  <Package className="text-blue-500" size={24} />
                )}
                <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              <div className="text-2xl font-bold text-green-600 mb-4">
                ₹{product.price.toFixed(2)}
                {product.mode === 'subscription' && (
                  <span className="text-sm text-gray-500 font-normal">/year</span>
                )}
              </div>

              {product.mode === 'subscription' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    Your subscription is now active! You'll be charged yearly until you cancel.
                  </p>
                </div>
              )}

              {product.mode === 'payment' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    Your one-time purchase is complete! You now have lifetime access to these features.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>Go to Dashboard</span>
                <ArrowRight size={20} />
              </Link>

              <Link
                to="/plans"
                className="inline-flex items-center space-x-2 border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                <span>View All Plans</span>
              </Link>
            </div>

            <div className="text-sm text-gray-500">
              <p>A confirmation email has been sent to your registered email address.</p>
              <p>You can view your purchase history in your dashboard.</p>
            </div>
          </motion.div>

          {/* What's Next Section */}
          <motion.div
            className="mt-16 bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Next?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Explore Features</h3>
                <p className="text-gray-600 text-sm">
                  Check out your dashboard to see all the new features you now have access to.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Start Lending</h3>
                <p className="text-gray-600 text-sm">
                  Browse loan requests and start earning returns by helping fellow students.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Support</h3>
                <p className="text-gray-600 text-sm">
                  Need help? Our AI assistant and support team are here to help you succeed.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessPage;