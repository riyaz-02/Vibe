import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Minus, CreditCard, TrendingUp, TrendingDown, Clock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../../hooks/useWallet';
import AddFundsModal from './AddFundsModal';
import toast from 'react-hot-toast';

interface WalletCardProps {
  className?: string;
}

const WalletCard: React.FC<WalletCardProps> = ({ className = '' }) => {
  const { wallet, transactions, loading, addFunds, refetch } = useWallet();
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch wallet data on mount
    refetch();
  }, []);

  const handleAddFunds = async (amount: number) => {
    try {
      await addFunds(amount);
      toast.success(`₹${amount.toLocaleString()} added to your Vibe Wallet!`);
      setShowAddFunds(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to add funds');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast.success('Wallet refreshed');
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && !wallet) {
    return (
      <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className={`bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg text-white p-6 ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Wallet size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Vibe Wallet</h3>
              <p className="text-blue-100 text-sm">Available Balance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 bg-white bg-opacity-10 rounded-full hover:bg-opacity-20 transition-all"
              title="Refresh wallet"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            </button>
            <div className="text-right">
              <div className="text-2xl font-bold">
                {formatCurrency(wallet?.balance || 0)}
              </div>
              <div className="text-blue-100 text-sm">{wallet?.currency || 'INR'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <motion.button
            onClick={() => setShowAddFunds(true)}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-3 flex items-center justify-center space-x-2 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} />
            <span className="font-medium">Add Funds</span>
          </motion.button>
          
          <motion.button
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-3 flex items-center justify-center space-x-2 transition-all opacity-50 cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled
          >
            <Minus size={18} />
            <span className="font-medium">Withdraw</span>
          </motion.button>
        </div>

        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="w-full text-center text-blue-100 text-sm hover:text-white transition-colors"
        >
          {showTransactions ? 'Hide' : 'View'} Transaction History
        </button>

        <AnimatePresence>
          {showTransactions && (
            <motion.div
              className="mt-4 space-y-2 max-h-60 overflow-y-auto"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white bg-opacity-10 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        transaction.transaction_type === 'credit' 
                          ? 'bg-green-500 bg-opacity-20' 
                          : 'bg-red-500 bg-opacity-20'
                      }`}>
                        {transaction.transaction_type === 'credit' ? (
                          <TrendingUp size={16} className="text-green-300" />
                        ) : (
                          <TrendingDown size={16} className="text-red-300" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium">
                          {transaction.description}
                        </div>
                        <div className="text-xs text-blue-200">
                          {formatDate(transaction.created_at)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        transaction.transaction_type === 'credit' 
                          ? 'text-green-300' 
                          : 'text-red-300'
                      }`}>
                        {transaction.transaction_type === 'credit' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                      <div className="text-xs text-blue-200">
                        Balance: {formatCurrency(transaction.balance_after)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-blue-200">
                  <Clock size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No transactions yet</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AddFundsModal
        isOpen={showAddFunds}
        onClose={() => setShowAddFunds(false)}
        onAddFunds={handleAddFunds}
        loading={loading}
      />
    </>
  );
};

export default WalletCard;