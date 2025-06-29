import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Icon */}
        <motion.div
          className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle className="text-white" size={40} />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to Premium!
          </h1>
          <p className="text-gray-600 mb-8">
            Your subscription has been activated successfully. You now have access to all premium features.
          </p>
        </motion.div>

        {/* Premium Features */}
        <motion.div
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Crown className="text-yellow-500" size={24} />
            <h3 className="text-lg font-semibold text-gray-900">Premium Features Unlocked</h3>
          </div>
          
          <ul className="space-y-2 text-left text-gray-600">
            <li className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={16} />
              <span>Priority loan matching</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={16} />
              <span>Advanced analytics & insights</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={16} />
              <span>Enhanced security features</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="text-green-500" size={16} />
              <span>Premium support</span>
            </li>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Go to Dashboard</span>
            <ArrowRight size={20} />
          </button>
          
          <button
            onClick={() => navigate('/subscription')}
            className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Manage Subscription
          </button>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-8 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Thank you for choosing LendConnect Premium!</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SuccessPage;