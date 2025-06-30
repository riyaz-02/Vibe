import React from 'react';
import { Check, Crown, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { StripeProduct } from '../../stripe-config';
import { useStripe } from '../../hooks/useStripe';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: StripeProduct;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { purchaseProduct, loading } = useStripe();
  const { user } = useAuth();

  const handlePurchase = async () => {
    if (!user) {
      toast.error('Please sign in to purchase');
      return;
    }

    try {
      await purchaseProduct(product);
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to start checkout');
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(price);
  };

  const getProductIcon = () => {
    if (product.popular) {
      return <Crown className="text-yellow-500" size={24} />;
    }
    return <Zap className="text-blue-500" size={24} />;
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
        product.popular 
          ? 'border-yellow-400 ring-2 ring-yellow-100' 
          : 'border-gray-200 hover:border-blue-300'
      } ${className}`}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {product.popular && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-center py-2 rounded-t-2xl">
          <span className="text-sm font-semibold">Most Popular</span>
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
              {formatPrice(product.price, product.currency)}
            </span>
            {product.mode === 'subscription' && (
              <span className="text-gray-500">/month</span>
            )}
          </div>
          {product.mode === 'payment' && (
            <p className="text-sm text-gray-500 mt-1">One-time payment</p>
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
          disabled={loading}
          className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
            product.popular
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white hover:from-yellow-500 hover:to-orange-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
          } disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
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
      </div>
    </motion.div>
  );
};

export default ProductCard;