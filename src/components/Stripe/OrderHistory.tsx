import React, { useEffect, useState } from 'react';
import { Calendar, CreditCard, Package, CheckCircle, Clock, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStripe, UserOrder } from '../../hooks/useStripe';
import { getProductByPriceId } from '../../stripe-config';

interface OrderHistoryProps {
  className?: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ className = '' }) => {
  const { orders, fetchUserOrders, stripeConfigured } = useStripe();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      if (stripeConfigured) {
        setLoading(true);
        await fetchUserOrders();
      }
      setLoading(false);
    };

    loadOrders();
  }, [stripeConfigured]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'canceled':
        return <X className="text-red-500" size={16} />;
      default:
        return <Package className="text-gray-500" size={16} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'canceled':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Don't show anything if Stripe is not configured
  if (!stripeConfigured) {
    return null;
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
        <div className="text-center py-8">
          <Package className="text-gray-300 mx-auto mb-4" size={48} />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h4>
          <p className="text-gray-600">Your purchase history will appear here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Order History</h3>
      
      <div className="space-y-4">
        {orders.map((order, index) => (
          <motion.div
            key={order.order_id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Package className="text-blue-500" size={20} />
                <div>
                  <h4 className="font-medium text-gray-900">
                    Order #{order.order_id}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {order.checkout_session_id.slice(0, 20)}...
                  </p>
                </div>
              </div>
              
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.order_status)}`}>
                {getStatusIcon(order.order_status)}
                <span>{formatStatus(order.order_status)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <CreditCard size={14} className="text-gray-400" />
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium text-gray-900">
                  {formatPrice(order.amount_total, order.currency)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-900">
                  {formatDate(order.order_date)}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <Package size={14} className="text-gray-400" />
                <span className="text-gray-600">Payment:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {order.payment_status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {order.amount_subtotal !== order.amount_total && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-900">
                    {formatPrice(order.amount_subtotal, order.currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">
                    {formatPrice(order.amount_total, order.currency)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;