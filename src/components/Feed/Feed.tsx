import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, TrendingUp, LogIn, Zap, Heart, MessageCircle, Share2, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';
import { useLoans } from '../../hooks/useLoans';
import { useTranslation } from '../../utils/translations';
import LoanCard from './LoanCard';
import PostLoanModal from '../Loans/PostLoanModal';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Feed: React.FC = () => {
  const { currentLanguage, addNotification } = useStore();
  const { user } = useAuth();
  const { loans, loading, fundLoan } = useLoans();
  const t = useTranslation(currentLanguage);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showPostModal, setShowPostModal] = useState(false);

  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         loan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || loan.purpose === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleLend = async (loanId: string, amount: number) => {
    if (!user) {
      toast.error('Please sign in to lend money');
      return;
    }

    try {
      const { error } = await fundLoan(loanId, amount);
      if (error) throw error;
      
      toast.success(`Successfully lent ₹${amount}! Transaction processing...`);
      
      // Add notification
      addNotification({
        id: Date.now().toString(),
        userId: user.id,
        type: 'loan_funded',
        title: 'Loan Funded',
        message: `You successfully lent ₹${amount}`,
        isRead: false,
        createdAt: new Date()
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to process lending');
    }
  };

  const filters = [
    { value: 'all', label: 'All Loans', icon: '🌟' },
    { value: 'medical', label: 'Medical', icon: '🏥' },
    { value: 'education', label: 'Education', icon: '🎓' },
    { value: 'rent', label: 'Rent', icon: '🏠' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Loading Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 animate-pulse">
            <div className="h-8 bg-white/20 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-white/20 rounded w-2/3"></div>
          </div>
          
          {/* Loading Cards */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Modern Feed Header */}
      <motion.div
        className="bg-gradient-to-r from-blue-500 via-purple-600 to-teal-500 rounded-2xl shadow-xl border border-white/20 p-8 mb-8 relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"
          animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <motion.div 
                  className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Sparkles className="text-white" size={24} />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Student Vibe Feed</h1>
                  <p className="text-blue-100">Connect • Support • Grow Together</p>
                </div>
              </div>
              <p className="text-white/90 text-lg max-w-2xl">
                Join the global community of students helping each other achieve their dreams through peer-to-peer lending
              </p>
            </div>
            
            {user ? (
              <motion.button
                onClick={() => setShowPostModal(true)}
                className="bg-white/20 backdrop-blur-lg text-white px-8 py-4 rounded-xl font-semibold flex items-center space-x-3 hover:bg-white/30 transition-all duration-200 border border-white/30"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={24} />
                <span>Share Your Story</span>
              </motion.button>
            ) : (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6 text-center">
                <LogIn className="text-white mx-auto mb-3" size={32} />
                <h3 className="text-white font-semibold mb-2">Join the Vibe!</h3>
                <p className="text-white/80 text-sm">Sign in to post requests and connect with lenders</p>
              </div>
            )}
          </div>

          {/* Modern Search and Filter */}
          <div className="mt-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
              <input
                type="text"
                placeholder="Search stories, needs, dreams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
              />
            </div>
            
            <div className="flex flex-wrap gap-3">
              {filters.map(filter => (
                <motion.button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedFilter === filter.value
                      ? 'bg-white text-blue-600 shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Trending Section */}
      <motion.div
        className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 mb-8 border border-orange-200"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center space-x-3 mb-3">
          <TrendingUp className="text-orange-500" size={24} />
          <h2 className="font-bold text-orange-800 text-lg">🔥 Trending: AI-Verified Medical Campaigns</h2>
        </div>
        <p className="text-orange-700">
          Support students facing medical emergencies. All medical loans are verified through our Gemini AI prescription detection system.
        </p>
      </motion.div>

      {/* Social Feed Cards */}
      <div className="space-y-6">
        {filteredLoans.map((loan, index) => (
          <motion.div
            key={loan.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LoanCard loan={loan} onLend={handleLend} />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLoans.length === 0 && !loading && (
        <motion.div
          className="text-center py-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No stories found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or explore different categories to find the perfect vibe!</p>
          <button
            onClick={() => setSelectedFilter('all')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
          >
            Show All Stories
          </button>
        </motion.div>
      )}

      {/* Post Loan Modal */}
      <PostLoanModal 
        isOpen={showPostModal} 
        onClose={() => setShowPostModal(false)} 
      />
    </div>
  );
};

export default Feed;