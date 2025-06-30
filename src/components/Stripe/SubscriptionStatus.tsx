import React, { useEffect, useState } from 'react';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStripe, UserSubscription } from '../../hooks/useStripe';
import { getProductByPriceId } from '../../stripe-config';

interface SubscriptionStatusProps {
  className?: string;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ className = '' }) => {
  const { subscription, fetchUserSubscription, loading } = useStripe();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSubscription = async () => {
      setIsLoading(true);
      await fetchUserSubscription();
      setIsLoading(false);
    };

    loadSubscription();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'trialing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'past_due':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'canceled':
      case 'unpaid':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'incomplete':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} />;
      case 'trialing':
        return <Crown size={16} />;
      case 'past_due':
      case 'incomplete':
        return <AlertCircle size={16} />;
      case 'canceled':
      case 'unpaid':
        return <X size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!subscription || subscription.subscription_status === 'not_started') {
    return (
      <div className={`bg-gray-50 rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-center space-x-2 text-gray-600">
          <Crown size={16} />
          <span className="text-sm font-medium">No Active Subscription</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Upgrade to unlock premium features
        </p>
      </div>
    );
  }

  const product = subscription.price_id ? getProductByPriceId(subscription.price_id) : null;
  const statusColor = getStatusColor(subscription.subscription_status);
  const StatusIcon = () => getStatusIcon(subscription.subscription_status);

  return (
    <motion.div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Crown className="text-yellow-500" size={16} />
          <span className="font-medium text-gray-900">
            {product?.name || 'Subscription'}
          </span>
        </div>
        <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
          <StatusIcon />
          <span>{formatStatus(subscription.subscription_status)}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {subscription.current_period_end && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center space-x-1">
              <Calendar size={14} />
              <span>
                {subscription.subscription_status === 'active' ? 'Renews' : 'Expires'}
              </span>
            </span>
            <span className="font-medium text-gray-900">
              {formatDate(subscription.current_period_end)}
            </span>
          </div>
        )}

        {subscription.payment_method_brand && subscription.payment_method_last4 && (
          <div className="flex items-center justify-between">
            <span className="text-gray-500 flex items-center space-x-1">
              <CreditCard size={14} />
              <span>Payment</span>
            </span>
            <span className="font-medium text-gray-900">
              {subscription.payment_method_brand.toUpperCase()} ****{subscription.payment_method_last4}
            </span>
          </div>
        )}

        {subscription.cancel_at_period_end && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mt-2">
            <p className="text-orange-800 text-xs">
              Your subscription will cancel at the end of the current period.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SubscriptionStatus;