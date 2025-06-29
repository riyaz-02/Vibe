import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Clock, IndianRupee, CheckCircle, Stethoscope, BookOpen, Home, AlertCircle, Eye, MoreHorizontal, Bookmark } from 'lucide-react';
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
  const [showComments, setShowComments] = useState(false);

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
    medical: 'text-red-500 bg-red-50 border-red-200',
    education: 'text-green-500 bg-green-50 border-green-200',
    textbooks: 'text-blue-500 bg-blue-50 border-blue-200',
    rent: 'text-orange-500 bg-orange-50 border-orange-200',
    emergency: 'text-red-600 bg-red-50 border-red-200',
    'assistive-devices': 'text-purple-500 bg-purple-50 border-purple-200',
    other: 'text-gray-500 bg-gray-50 border-gray-200'
  };

  const PurposeIcon = purposeIcons[loan.purpose] || Clock;
  const progressPercentage = (loan.totalFunded / loan.amount) * 100;
  const remainingAmount = loan.amount - loan.totalFunded;

  const handleLike = () => {
    setIsLiked(!isLiked);
    if (!isLiked) {
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
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <motion.img
              src={loan.borrower.avatar}
              alt={loan.borrower.name}
              className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-lg"
              whileHover={{ scale: 1.1 }}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-bold text-gray-900 text-lg">{loan.borrower.name}</h3>
                {loan.borrower.isVerified && (
                  <CheckCircle size={18} className="text-blue-500" />
                )}
              </div>
              <div className="flex items-center space-x-3">
                <p className="text-gray-500 text-sm">
                  {formatDistanceToNow(loan.createdAt, { addSuffix: true })}
                </p>
                <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${purposeColors[loan.purpose]}`}>
                  <PurposeIcon size={12} />
                  <span className="capitalize">{loan.purpose.replace('-', ' ')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bookmark size={18} className="text-gray-400" />
            </motion.button>
            <motion.button
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MoreHorizontal size={18} className="text-gray-400" />
            </motion.button>
          </div>
        </div>

        {/* Medical Verification Badge */}
        {loan.medicalVerification && (
          <motion.div
            className="mt-3 inline-flex items-center space-x-2 bg-green-50 text-green-700 px-3 py-2 rounded-full text-sm font-semibold border border-green-200"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CheckCircle size={16} />
            <span>AI Verified Medical</span>
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="px-6 pb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{loan.title}</h2>
        <p className={`text-gray-700 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
          {loan.description}
        </p>
        {loan.description.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 text-sm font-semibold mt-2 hover:text-blue-700 transition-colors"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}

        {/* Images */}
        {loan.images && loan.images.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-3">
            {loan.images.map((image, index) => (
              <motion.img
                key={index}
                src={image}
                alt={`Loan documentation ${index + 1}`}
                className="w-full h-64 object-cover rounded-xl border border-gray-200"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Loan Metrics */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div className="text-center">
            <p className="text-gray-500 font-medium">Progress</p>
            <p className="font-bold text-gray-900 text-lg">{progressPercentage.toFixed(0)}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 font-medium">Amount</p>
            <p className="font-bold text-gray-900 text-lg flex items-center justify-center">
              <IndianRupee size={16} />
              {loan.amount.toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 font-medium">Interest</p>
            <p className="font-bold text-gray-900 text-lg">{loan.interestRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 font-medium">Tenure</p>
            <p className="font-bold text-gray-900 text-lg">{loan.tenure} days</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span>₹{loan.totalFunded.toLocaleString()} funded</span>
            <span>₹{remainingAmount.toLocaleString()} remaining</span>
          </div>
        </div>
      </div>

      {/* Social Actions */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <motion.button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-all ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="font-semibold">{loan.likes + (isLiked ? 1 : 0)}</span>
            </motion.button>
            
            <motion.button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-500 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle size={20} />
              <span className="font-semibold">{loan.comments.length}</span>
            </motion.button>
            
            <motion.button
              className="flex items-center space-x-2 text-gray-500 hover:text-green-500 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Share2 size={20} />
              <span className="font-semibold">{loan.shares}</span>
            </motion.button>
          </div>

          {/* Lend Button */}
          {loan.status === 'active' && remainingAmount > 0 && currentUser?.id !== loan.borrowerId && (
            <motion.button
              onClick={() => setShowLendModal(true)}
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              💫 Support Now
            </motion.button>
          )}

          {loan.status === 'funded' && (
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-xl text-sm font-bold border border-green-200">
              ✅ Fully Funded
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <motion.div
          className="border-t border-gray-100 p-6 bg-gray-50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <h4 className="font-semibold text-gray-900 mb-4">Comments</h4>
          <div className="space-y-3">
            {loan.comments.map((comment, index) => (
              <div key={index} className="flex space-x-3">
                <img
                  src={comment.user.avatar}
                  alt={comment.user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1 bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-sm text-gray-900">{comment.user.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Add Comment */}
          <div className="mt-4 flex space-x-3">
            <img
              src={currentUser?.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
              alt="You"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <input
                type="text"
                placeholder="Add a supportive comment..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Lend Modal */}
      {showLendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-xl font-bold mb-4 text-center">Support {loan.borrower.name}</h3>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount to lend (Max: ₹{remainingAmount.toLocaleString()})
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="number"
                  value={lendAmount}
                  onChange={(e) => setLendAmount(e.target.value)}
                  max={remainingAmount}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  placeholder="Enter amount"
                />
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>💡 Impact:</strong> Your support helps a fellow student achieve their dreams. 
                Platform fee: 1-2% • P2P lending involves risks.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLendModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLend}
                disabled={!lendAmount || parseFloat(lendAmount) <= 0 || parseFloat(lendAmount) > remainingAmount}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:from-blue-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all"
              >
                💫 Support Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default LoanCard;