import React from 'react';
import { Check, Crown, Zap, Package, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { StripeProduct, formatProductPrice } from '../../stripe-config';
import { useStripe } from '../../hooks/useStripe';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: StripeProduct;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { purchaseProduct, loading, stripeConfigured } = useStripe();
  const { user } = useAuth();

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    if (!stripeConfigured) {
      toast.error('Payment system is not configured. Please contact support.');
      return;
    }

    try {
      await purchaseProduct(product);
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to start checkout');
    }
  };

  const getProductIcon = () => {
    if (product.popular) {
      return <Crown className="text-yellow-500" size={24} />;
    }
    if (product.mode === 'subscription') {
      return <Zap className="text-blue-500" size={24} />;
    }
    if (product.name.startsWith('P7') || product.name.startsWith('P6') || product.name.startsWith('P5')) {
      return <Star className="text-purple-500" size={24} />;
    }
    return <Package className="text-green-500" size={24} />;
  };

  const getCardStyle = () => {
    if (product.popular) {
      return 'border-yellow-400 ring-2 ring-yellow-100 shadow-lg';
    }
    if (product.name.startsWith('P7')) {
      return 'border-purple-400 ring-2 ring-purple-100 shadow-lg';
    }
    return 'border-gray-200 hover:border-blue-300 hover:shadow-lg';
  };

  const getButtonStyle = () => {
    if (product.popular) {
      return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500';
    }
    if (product.name.startsWith('P7')) {
      return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600';
    }
    return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700';
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 ${getCardStyle()} ${className}`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {product.popular && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-center py-2 rounded-t-2xl">
          <span className="text-sm font-semibold">Most Popular</span>
        </div>
      )}

      {product.name.startsWith('P7') && (
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center py-2 rounded-t-2xl">
          <span className="text-sm font-semibold">Ultimate Plan</span>
        </div>
      )}

      <div className="p-8">
        <div className="flex items-center space-x-3 mb-4">
          {getProductIcon()}
          <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
        </div>

        <p className="text-gray-600 mb-6">{product.description}</p>

        <div className="mb-6">
          <div className="flex items-baseline space-x-2">
            <span className="text-4xl font-bold text-gray-900">
              {formatProductPrice(product)}
            </span>
            {product.mode === 'subscription' && (
              <span className="text-gray-500">/month</span>
            )}
          </div>
          {product.mode === 'payment' && (
            <p className="text-sm text-gray-500 mt-1">One-time payment</p>
          )}
          {product.currency === 'inr' && (
            <p className="text-xs text-blue-600 mt-1">🇮🇳 Indian Rupees</p>
          )}
        </div>

        {product.features && (
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 mb-3">Features included:</h4>
            <ul className="space-y-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <Check className="text-green-500 flex-shrink-0 mt-0.5" size={16} />
                  <span className="text-gray-600 text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={handlePurchase}
          disabled={loading || !stripeConfigured}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${getButtonStyle()} disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : !stripeConfigured ? (
            'Payment Unavailable'
          ) : (
            <>
              {product.mode === 'subscription' ? 'Subscribe Now' : 'Purchase Now'}
            </>
          )}
        </button>

        {product.mode === 'subscription' && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Cancel anytime. No long-term commitments.
          </p>
        )}

        {!stripeConfigured && (
          <p className="text-xs text-gray-500 text-center mt-3">
            Payment system configuration required
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;