import React, { useState } from 'react';
import { X, CreditCard, Shield, Zap, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStripe } from '../../hooks/useStripe';
import toast from 'react-hot-toast';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFunds: (amount: number) => Promise<void>;
  loading: boolean;
}

const AddFundsModal: React.FC<AddFundsModalProps> = ({
  isOpen,
  onClose,
  onAddFunds,
  loading
}) => {
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const { loading: stripeLoading } = useStripe();

  const quickAmounts = [1000, 5000, 10000, 50000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = selectedAmount || parseFloat(amount);
    
    if (!finalAmount || finalAmount < 100) {
      toast.error('Please enter a valid amount (minimum ₹100)');
      return;
    }

    try {
      await onAddFunds(finalAmount);
      setAmount('');
      setSelectedAmount(null);
    } catch (error) {
      // Error handling is done in parent component
    }
  };

  const handleQuickAmount = (quickAmount: number) => {
    setSelectedAmount(quickAmount);
    setAmount(quickAmount.toString());
  };

  const finalAmount = selectedAmount || parseFloat(amount) || 0;
  const isProcessing = loading || stripeLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <CreditCard className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Add Funds</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                disabled={isProcessing}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Add
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSelectedAmount(null);
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                    min="100"
                    max="100000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: ₹100 • Maximum: ₹1,00,000
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => handleQuickAmount(quickAmount)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        selectedAmount === quickAmount
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      ₹{quickAmount.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {finalAmount >= 100 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="text-blue-600" size={16} />
                    <span className="font-medium text-blue-900">Transaction Summary</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Amount:</span>
                      <span className="font-medium text-blue-900">₹{finalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Processing Fee:</span>
                      <span className="font-medium text-blue-900">₹0</span>
                    </div>
                    <div className="border-t border-blue-200 pt-1 mt-2">
                      <div className="flex justify-between">
                        <span className="font-medium text-blue-900">Total:</span>
                        <span className="font-bold text-blue-900">₹{finalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Shield className="text-yellow-600 flex-shrink-0 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Secure Payment</p>
                    <p>Your payment is processed securely through Stripe. Funds will be instantly available in your Vibe Wallet.</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || finalAmount < 100}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={16} />
                      <span>Add ₹{finalAmount.toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddFundsModal;