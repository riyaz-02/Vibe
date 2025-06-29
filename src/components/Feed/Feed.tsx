import React, { useState, useEffect } from 'react';
import { Plus, Filter, Search, TrendingUp, LogIn } from 'lucide-react';
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
    { value: 'all', label: 'All Loans' },
    { value: 'medical', label: 'Medical' },
    { value: 'education', label: 'Education' },
    { value: 'rent', label: 'Rent' },
    { value: 'emergency', label: 'Emergency' }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      {/* Feed Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Loan Feed</h1>
            <p className="text-gray-600">Help students achieve their dreams through peer-to-peer lending</p>
          </div>
          
          {user ? (
            <motion.button
              onClick={() => setShowPostModal(true)}
              className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={20} />
              <span>{t('button.post_loan')}</span>
            </motion.button>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-800">
                <LogIn size={20} />
                <span className="font-medium">Sign in to post loan requests and lend money</span>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 mt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search loan requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {filters.map(filter => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 mb-6 border border-orange-200">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="text-orange-500" size={20} />
          <h2 className="font-semibold text-orange-800">Trending: Medical Emergency Campaigns</h2>
        </div>
        <p className="text-orange-700 text-sm">
          Support students facing medical emergencies. All medical loans are verified through our AI prescription detection system.
        </p>
      </div>

      {/* Loan Cards */}
      <div className="space-y-4">
        {filteredLoans.map((loan, index) => (
          <motion.div
            key={loan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <LoanCard loan={loan} onLend={handleLend} />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredLoans.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No loans found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
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