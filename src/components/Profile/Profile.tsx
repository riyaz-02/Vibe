import React from 'react';
import { CheckCircle, Edit3, Star, TrendingUp, Award, Shield, Camera } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../utils/translations';
import { motion } from 'framer-motion';
import { mockUsers } from '../../utils/mockData';

const Profile: React.FC = () => {
  const { currentLanguage, currentUser } = useStore();
  const t = useTranslation(currentLanguage);

  // Use mock user if no current user
  const user = currentUser || mockUsers[0];

  const BadgeCard = ({ badge }: any) => (
    <motion.div
      className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">{badge.icon}</div>
        <h4 className="font-semibold text-gray-900 mb-1">{badge.name}</h4>
        <p className="text-sm text-gray-600">{badge.description}</p>
        <div className="text-xs text-gray-500 mt-2">
          Earned {badge.earnedAt.toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );

  const StatItem = ({ label, value, icon: Icon, color }: any) => (
    <div className="text-center">
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mx-auto mb-2`}>
        <Icon size={20} className="text-white" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Cover Photo */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500"></div>
        
        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
            <div className="flex items-end space-x-4">
              {/* Profile Picture */}
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              
              {/* Basic Info */}
              <div className="pb-4">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  {user.isVerified && (
                    <CheckCircle size={24} className="text-blue-500" />
                  )}
                </div>
                <p className="text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-500" size={16} fill="currentColor" />
                    <span className="text-sm font-medium">{user.stats.averageRating}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Member since {user.createdAt.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit3 size={16} />
                <span>Edit Profile</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Shield size={16} />
                <span>Verify Identity</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Performance Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatItem
            label="Loans Given"
            value={user.stats.totalLoansGiven}
            icon={TrendingUp}
            color="bg-blue-500"
          />
          <StatItem
            label="Loans Taken"
            value={user.stats.totalLoansTaken}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatItem
            label="Successful Repayments"
            value={user.stats.successfulRepayments}
            icon={CheckCircle}
            color="bg-purple-500"
          />
          <StatItem
            label="Total Amount Lent"
            value={`₹${(user.stats.totalAmountLent / 1000).toFixed(0)}K`}
            icon={Award}
            color="bg-orange-500"
          />
        </div>
      </motion.div>

      {/* Badges Section */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('profile.badges')}</h2>
          <div className="text-sm text-gray-500">{user.badges.length} earned</div>
        </div>
        
        {user.badges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
            <p className="text-gray-600">Start lending or borrowing to earn your first badge!</p>
          </div>
        )}
      </motion.div>

      {/* Accessibility Settings */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Accessibility Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{t('accessibility.voice_nav')}</h3>
              <p className="text-sm text-gray-600">Navigate using voice commands</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.accessibilitySettings.voiceNavigation}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{t('accessibility.high_contrast')}</h3>
              <p className="text-sm text-gray-600">Enable high contrast mode</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.accessibilitySettings.highContrast}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Screen Reader Support</h3>
              <p className="text-sm text-gray-600">Optimize for screen readers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user.accessibilitySettings.screenReader}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Verification Status */}
      <motion.div
        className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="text-green-600" size={24} />
          <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-green-800">Email Verified</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-green-800">Phone Verified</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-green-800">Identity Verified</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-green-800">Bank Account Linked</span>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Blockchain Identity:</strong> Your verified identity is secured on the Algorand blockchain. 
            <a href="#" className="text-blue-600 hover:underline ml-1">View on Explorer</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;