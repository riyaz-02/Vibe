import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, TrendingUp, LogIn, Zap, Heart, MessageCircle, Share2, Sparkles, Users, DollarSign, Award, Target, Clock, Star } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';
import { useLoans } from '../../hooks/useLoans';
import { useTranslation } from '../../utils/translations';
import LoanCard from './LoanCard';
import PostLoanModal from '../Loans/PostLoanModal';
import LoanCalculator from '../Loans/LoanCalculator';
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
  const [showCalculator, setShowCalculator] = useState(false);

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

  // Mock data for sidebar stats
  const sidebarStats = {
    trendingLenders: [
      { name: 'Rahul K.', amount: '₹45,000', loans: 12, avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      { name: 'Priya S.', amount: '₹32,000', loans: 8, avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      { name: 'Amit P.', amount: '₹28,500', loans: 6, avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }
    ],
    trendingBorrowers: [
      { name: 'Sarah M.', purpose: 'Medical', amount: '₹15,000', avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      { name: 'David L.', purpose: 'Education', amount: '₹8,000', avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
      { name: 'Maya K.', purpose: 'Textbooks', amount: '₹3,500', avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' }
    ],
    studentsHelped: 1247,
    totalFunded: '₹2.4Cr',
    successRate: 94.5,
    avgInterest: 6.8
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content loading */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 animate-pulse">
                <div className="h-8 bg-white/20 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-white/20 rounded w-2/3"></div>
              </div>
              
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
            
            {/* Sidebar loading */}
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Feed Content */}
          <div className="lg:col-span-3">
            {/* Simplified Header */}
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl shadow-xl p-6 mb-8 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Student Vibe Feed</h1>
                  <p className="text-blue-100">Connect • Support • Grow Together</p>
                </div>
                
                {user && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
                    <motion.button
                      onClick={() => setShowCalculator(!showCalculator)}
                      className="bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:bg-white/30 transition-all duration-200 border border-white/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Calculator size={20} />
                      <span>Loan Calculator</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setShowPostModal(true)}
                      className="bg-white/20 backdrop-blur-lg text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 hover:bg-white/30 transition-all duration-200 border border-white/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Plus size={20} />
                      <span>Share Your Story</span>
                    </motion.button>
                  </div>
                )}
              </div>

              {/* Search and Filter */}
              <div className="mt-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                  <input
                    type="text"
                    placeholder="Search stories, needs, dreams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20 transition-all"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
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
            </motion.div>

            {/* Loan Calculator (Collapsible) */}
            <AnimatePresence>
              {showCalculator && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <LoanCalculator />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Feed Cards */}
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
                <p className="text-gray-600 mb-6">Try adjusting your search or explore different categories!</p>
                <button
                  onClick={() => setSelectedFilter('all')}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Show All Stories
                </button>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Platform Stats */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Target className="text-blue-500" size={20} />
                <span>Platform Impact</span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Students Helped</span>
                  <span className="font-bold text-green-600">{sidebarStats.studentsHelped.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Funded</span>
                  <span className="font-bold text-blue-600">{sidebarStats.totalFunded}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-purple-600">{sidebarStats.successRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Interest</span>
                  <span className="font-bold text-orange-600">{sidebarStats.avgInterest}%</span>
                </div>
              </div>
            </motion.div>

            {/* Trending Lenders */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="text-green-500" size={20} />
                <span>Top Lenders</span>
              </h3>
              <div className="space-y-3">
                {sidebarStats.trendingLenders.map((lender, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img
                      src={lender.avatar}
                      alt={lender.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{lender.name}</div>
                      <div className="text-sm text-gray-500">{lender.loans} loans • {lender.amount}</div>
                    </div>
                    <Star className="text-yellow-500" size={16} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Trending Borrowers */}
            <motion.div
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="text-blue-500" size={20} />
                <span>Recent Requests</span>
              </h3>
              <div className="space-y-3">
                {sidebarStats.trendingBorrowers.map((borrower, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img
                      src={borrower.avatar}
                      alt={borrower.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{borrower.name}</div>
                      <div className="text-sm text-gray-500">{borrower.purpose} • {borrower.amount}</div>
                    </div>
                    <Clock className="text-gray-400" size={16} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-all">
                  <div className="font-medium">🎯 Find Perfect Loans</div>
                  <div className="text-sm opacity-90">Browse by category</div>
                </button>
                <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-all">
                  <div className="font-medium">📊 View Analytics</div>
                  <div className="text-sm opacity-90">Track your impact</div>
                </button>
                <button className="w-full bg-white/20 hover:bg-white/30 rounded-lg p-3 text-left transition-all">
                  <div className="font-medium">🤝 Join Community</div>
                  <div className="text-sm opacity-90">Connect with others</div>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Post Loan Modal */}
      <PostLoanModal 
        isOpen={showPostModal} 
        onClose={() => setShowPostModal(false)} 
      />
    </div>
  );
};

export default Feed;