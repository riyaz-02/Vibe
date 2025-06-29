import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Clock, IndianRupee, CheckCircle, Stethoscope, BookOpen, Home, AlertCircle } from 'lucide-react';
import { LoanRequest } from '../../types';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import confetti from 'canvas-confetti';

interface LoanCardProps {
  loan: LoanRequest;
  onLend?: (loanId: string, amount: number) => void;
}

const LoanCard: React.FC<LoanCardProps> = ({ loan, onLend }) => {
  const { currentLanguage, currentUser } = useStore();
  const t = useTranslation(currentLanguage);
  const [isLiked, setIsLiked] = useState(false);
  const [showLendModal, setShowLendModal] = useState(false);
  const [lendAmount, setLendAmount] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const purposeIcons = {
    medical: Stethoscope,
    education: BookOpen,
    textbooks: BookOpen,
    rent: Home,
    emergency: AlertCircle,
    'assistive-devices': CheckCircle,
    other: Clock
  };

  const purposeColors = {
    medical: 'text-red-500 bg-red-50',
    education: 'text-green-500 bg-green-50',
    textbooks: 'text-blue-500 bg-blue-50',
    rent: 'text-orange-500 bg-orange-50',
    emergency: 'text-red-600 bg-red-50',
    'assistive-devices': 'text-purple-500 bg-purple-50',
    other: 'text-gray-500 bg-gray-50'
  };

  const PurposeIcon = purposeIcons[loan.purpose] || Clock;
  const progressPercentage = (loan.totalFunded / loan.amount) * 100;
  const remainingAmount = loan.amount - loan.totalFunded;

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
      // Trigger small confetti effect
      confetti({
        particleCount: 20,
        spread: 30,
        origin: { y: 0.8 }
      });
    }
  };

  const handleLend = () => {
    const amount = parseFloat(lendAmount);
    if (amount > 0 && amount <= remainingAmount && onLend) {
      onLend(loan.id, amount);
      setShowLendModal(false);
      setLendAmount('');
      
      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <motion.div
      className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <img
            src={loan.borrower.avatar}
            alt={loan.borrower.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{loan.borrower.name}</h3>
              {loan.borrower.isVerified && (
                <CheckCircle size={16} className="text-blue-500" />
              )}
              <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${purposeColors[loan.purpose]}`}>
                <PurposeIcon size={12} />
                <span className="capitalize">{loan.purpose.replace('-', ' ')}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(loan.createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>

        {/* Medical Verification Badge */}
        {loan.medicalVerification && (
          <div className="mt-3 inline-flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
            <CheckCircle size={14} />
            <span>{t('loan.medical_verified')}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{loan.title}</h2>
        <p className={`text-gray-600 ${isExpanded ? '' : 'line-clamp-3'}`}>
          {loan.description}
        </p>
        {loan.description.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 text-sm font-medium mt-1 hover:text-blue-700"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Images */}
        {loan.images && loan.images.length > 0 && (
          <div className="mt-3 grid grid-cols-1 gap-2">
            {loan.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Loan documentation ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
      </div>

      {/* Loan Details */}
      <div className="px-4 py-3 bg-gray-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t('loan.funding_progress')}</p>
            <p className="font-semibold text-gray-900">{progressPercentage.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-gray-500">Amount</p>
            <p className="font-semibold text-gray-900 flex items-center">
              <IndianRupee size={14} />
              {loan.amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t('loan.interest_rate')}</p>
            <p className="font-semibold text-gray-900">{loan.interestRate}%</p>
          </div>
          <div>
            <p className="text-gray-500">{t('loan.tenure')}</p>
            <p className="font-semibold text-gray-900">{loan.tenure} days</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>₹{loan.totalFunded.toLocaleString()} funded</span>
            <span>₹{remainingAmount.toLocaleString()} remaining</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-sm">{loan.likes + (isLiked ? 1 : 0)}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
              <MessageCircle size={18} />
              <span className="text-sm">{loan.comments.length}</span>
            </button>
            
            <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors">
              <Share2 size={18} />
              <span className="text-sm">{loan.shares}</span>
            </button>
          </div>

          {/* Lend Button */}
          {loan.status === 'active' && remainingAmount > 0 && currentUser?.id !== loan.borrowerId && (
            <motion.button
              onClick={() => setShowLendModal(true)}
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all duration-200 transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('button.lend_now')}
            </motion.button>
          )}

          {loan.status === 'funded' && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
              Fully Funded ✅
            </div>
          )}
        </div>
      </div>

      {/* Lend Modal */}
      {showLendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-lg font-semibold mb-4">Lend to {loan.borrower.name}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to lend (Max: ₹{remainingAmount.toLocaleString()})
              </label>
              <input
                type="number"
                value={lendAmount}
                onChange={(e) => setLendAmount(e.target.value)}
                max={remainingAmount}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm">
                <strong>Disclaimer:</strong> P2P lending involves risks. Please assess the loan viability carefully.
                Platform fee: 1-2% will be deducted.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLendModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLend}
                disabled={!lendAmount || parseFloat(lendAmount) <= 0 || parseFloat(lendAmount) > remainingAmount}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Lend
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default LoanCard;