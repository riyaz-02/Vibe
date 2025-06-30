import React, { useEffect, useState } from 'react';
import { CheckCircle, Edit3, Star, TrendingUp, Award, Shield, Camera, User, Mail, Phone, Calendar, Save, X, Lightbulb, Target, Users, DollarSign, Clock, Eye, Settings } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../utils/translations';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { mockUsers } from '../../utils/mockData';
import AgreementsSection from './AgreementsSection';
import SubscriptionStatus from '../Stripe/SubscriptionStatus';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { currentLanguage, currentUser, setCurrentUser } = useStore();
  const { user } = useAuth();
  const t = useTranslation(currentLanguage);
  const [profileData, setProfileData] = useState(currentUser || mockUsers[0]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    language: 'en'
  });
  const [userLoans, setUserLoans] = useState([]);
  const [showBadgeTooltip, setShowBadgeTooltip] = useState<string | null>(null);

  // Badge criteria and rules
  const badgeCriteria = {
    'first-loan': {
      name: 'First Loan',
      description: 'Posted your first loan request',
      icon: '🎯',
      category: 'borrower',
      criteria: 'Post your first loan request on the platform',
      points: 10
    },
    'timely-repayer': {
      name: 'Timely Repayer',
      description: 'Repaid all loans on time',
      icon: '🏆',
      category: 'borrower',
      criteria: 'Repay 3+ loans without any delays',
      points: 50
    },
    'generous-lender': {
      name: 'Generous Lender',
      description: 'Funded 10+ loans',
      icon: '💫',
      category: 'lender',
      criteria: 'Successfully fund 10 or more loan requests',
      points: 100
    },
    'impact-star': {
      name: 'Impact Star',
      description: 'Funded medical/accessibility loans',
      icon: '⭐',
      category: 'community',
      criteria: 'Fund 5+ medical or accessibility-related loans',
      points: 75
    },
    'verified-member': {
      name: 'Verified Member',
      description: 'Completed identity verification',
      icon: '✅',
      category: 'community',
      criteria: 'Complete identity verification process',
      points: 25
    },
    'community-helper': {
      name: 'Community Helper',
      description: 'Active in community discussions',
      icon: '🤝',
      category: 'community',
      criteria: 'Post 50+ helpful comments and interactions',
      points: 30
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfileData();
      fetchUserLoans();
    } else {
      setProfileData(mockUsers[0]);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (profileData) {
      setEditForm({
        name: profileData.name,
        phone: profileData.phone || '',
        language: profileData.language
      });
    }
  }, [profileData]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      if (!supabase || !user) {
        setProfileData(mockUsers[0]);
        setLoading(false);
        return;
      }

      // Use maybeSingle() to handle cases where profile doesn't exist
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_stats(*),
          accessibility_settings(*),
          badges(*)
        `)
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setProfileData(mockUsers[0]);
        setLoading(false);
        return;
      }

      // If no profile exists, use the current user data from the store
      if (!profile) {
        console.log('No profile found, using current user data');
        if (currentUser) {
          setProfileData(currentUser);
        } else {
          setProfileData(mockUsers[0]);
        }
        setLoading(false);
        return;
      }

      // Fetch loan statistics
      const { data: loanFundings } = await supabase
        .from('loan_fundings')
        .select('amount')
        .eq('lender_id', user.id);

      const { data: loanRequests } = await supabase
        .from('loan_requests')
        .select('amount, status')
        .eq('borrower_id', user.id);

      // Calculate stats
      const totalAmountLent = loanFundings?.reduce((sum, funding) => sum + Number(funding.amount), 0) || 0;
      const totalAmountBorrowed = loanRequests?.reduce((sum, request) => sum + Number(request.amount), 0) || 0;
      const totalLoansGiven = loanFundings?.length || 0;
      const totalLoansTaken = loanRequests?.length || 0;
      const successfulRepayments = loanRequests?.filter(req => req.status === 'completed').length || 0;

      // Check and award badges (with error handling)
      try {
        await checkAndAwardBadges(user.id, {
          totalLoansGiven,
          totalLoansTaken,
          successfulRepayments,
          isVerified: profile?.is_verified || false
        });
      } catch (badgeError) {
        console.error('Error awarding badges:', badgeError);
        // Continue with profile loading even if badge awarding fails
      }

      const formattedProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        avatar: profile.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
        isVerified: profile.is_verified || false,
        badges: profile.badges || [],
        stats: {
          totalLoansGiven,
          totalLoansTaken,
          successfulRepayments,
          averageRating: profile.user_stats?.average_rating || 0,
          totalAmountLent,
          totalAmountBorrowed
        },
        createdAt: new Date(profile.created_at),
        language: profile.language || 'en',
        accessibilitySettings: profile.accessibility_settings || {
          voiceNavigation: false,
          highContrast: false,
          screenReader: false,
          fontSize: 'medium'
        }
      };

      setProfileData(formattedProfile);
      setCurrentUser(formattedProfile);

    } catch (error) {
      console.error('Error fetching profile data:', error);
      setProfileData(mockUsers[0]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserLoans = async () => {
    try {
      if (!supabase || !user) return;

      const { data: loans, error } = await supabase
        .from('loan_requests')
        .select(`
          *,
          loan_fundings(amount, funded_at)
        `)
        .eq('borrower_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user loans:', error);
        return;
      }

      setUserLoans(loans || []);
    } catch (error) {
      console.error('Error fetching user loans:', error);
    }
  };

  const checkAndAwardBadges = async (userId: string, stats: any) => {
    try {
      if (!supabase) return;

      // First, fetch existing badges for the user
      const { data: existingBadges, error: fetchError } = await supabase
        .from('badges')
        .select('name')
        .eq('user_id', userId);

      if (fetchError) {
        console.error('Error fetching existing badges:', fetchError);
        return;
      }

      const existingBadgeNames = new Set(existingBadges?.map(badge => badge.name) || []);

      const badgesToAward = [];

      // Check for first loan badge
      if (stats.totalLoansTaken >= 1 && !existingBadgeNames.has(badgeCriteria['first-loan'].name)) {
        badgesToAward.push({
          user_id: userId,
          name: badgeCriteria['first-loan'].name,
          description: badgeCriteria['first-loan'].description,
          icon: badgeCriteria['first-loan'].icon,
          category: badgeCriteria['first-loan'].category
        });
      }

      // Check for timely repayer badge
      if (stats.successfulRepayments >= 3 && !existingBadgeNames.has(badgeCriteria['timely-repayer'].name)) {
        badgesToAward.push({
          user_id: userId,
          name: badgeCriteria['timely-repayer'].name,
          description: badgeCriteria['timely-repayer'].description,
          icon: badgeCriteria['timely-repayer'].icon,
          category: badgeCriteria['timely-repayer'].category
        });
      }

      // Check for generous lender badge
      if (stats.totalLoansGiven >= 10 && !existingBadgeNames.has(badgeCriteria['generous-lender'].name)) {
        badgesToAward.push({
          user_id: userId,
          name: badgeCriteria['generous-lender'].name,
          description: badgeCriteria['generous-lender'].description,
          icon: badgeCriteria['generous-lender'].icon,
          category: badgeCriteria['generous-lender'].category
        });
      }

      // Check for verified member badge
      if (stats.isVerified && !existingBadgeNames.has(badgeCriteria['verified-member'].name)) {
        badgesToAward.push({
          user_id: userId,
          name: badgeCriteria['verified-member'].name,
          description: badgeCriteria['verified-member'].description,
          icon: badgeCriteria['verified-member'].icon,
          category: badgeCriteria['verified-member'].category
        });
      }

      // Only insert badges that don't already exist
      if (badgesToAward.length > 0) {
        const { error } = await supabase
          .from('badges')
          .insert(badgesToAward);

        if (error) {
          console.error('Error inserting badges:', error);
        }
      }
    } catch (error) {
      console.error('Error in checkAndAwardBadges:', error);
      // Don't throw error to prevent breaking the profile loading
    }
  };

  const handleEditProfile = async () => {
    try {
      if (!supabase || !user) {
        toast.error('Profile update not available in demo mode');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          language: editForm.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfileData(prev => ({
        ...prev,
        name: editForm.name,
        phone: editForm.phone,
        language: editForm.language
      }));

      setCurrentUser({
        ...profileData,
        name: editForm.name,
        phone: editForm.phone,
        language: editForm.language
      });

      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const BadgeCard = ({ badge }: any) => (
    <motion.div
      className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setShowBadgeTooltip(badge.name)}
      onMouseLeave={() => setShowBadgeTooltip(null)}
    >
      <div className="text-center">
        <div className="text-3xl mb-2">{badge.icon}</div>
        <h4 className="font-semibold text-gray-900 mb-1">{badge.name}</h4>
        <p className="text-sm text-gray-600">{badge.description}</p>
        <div className="text-xs text-gray-500 mt-2">
          Earned {new Date(badge.earnedAt || badge.earned_at).toLocaleDateString()}
        </div>
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showBadgeTooltip === badge.name && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg p-3 w-64 z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <div className="flex items-start space-x-2">
              <Lightbulb size={16} className="text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold mb-1">How to earn:</div>
                <div>{badgeCriteria[badge.name.toLowerCase().replace(/\s+/g, '-')]?.criteria || 'Complete specific actions on the platform'}</div>
                <div className="text-yellow-400 text-xs mt-1">
                  +{badgeCriteria[badge.name.toLowerCase().replace(/\s+/g, '-')]?.points || 10} points
                </div>
              </div>
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </motion.div>
        )}
      </AnimatePresence>
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="h-32 bg-gray-200"></div>
            <div className="relative px-6 pb-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16">
                <div className="flex items-end space-x-4">
                  <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
                  <div className="pb-4 space-y-2">
                    <div className="h-6 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  src={profileData.avatar}
                  alt={profileData.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <button className="absolute bottom-2 right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Camera size={16} />
                </button>
              </div>
              
              {/* Basic Info */}
              <div className="pb-4">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
                  {profileData.isVerified && (
                    <CheckCircle size={24} className="text-blue-500" />
                  )}
                </div>
                <p className="text-gray-600 flex items-center space-x-1">
                  <Mail size={14} />
                  <span>{profileData.email}</span>
                </p>
                {profileData.phone && (
                  <p className="text-gray-600 flex items-center space-x-1">
                    <Phone size={14} />
                    <span>{profileData.phone}</span>
                  </p>
                )}
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="text-yellow-500" size={16} fill="currentColor" />
                    <span className="text-sm font-medium">{profileData.stats.averageRating}</span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center space-x-1">
                    <Calendar size={14} />
                    <span>Member since {profileData.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-3 mt-4 md:mt-0">
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
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

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-xl max-w-md w-full p-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 XXXXX XXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language
                  </label>
                  <select
                    value={editForm.language}
                    onChange={(e) => setEditForm({ ...editForm, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी</option>
                    <option value="hinglish">Hinglish</option>
                    <option value="bn">বাংলা</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditProfile}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Subscription Status */}
      <SubscriptionStatus className="mb-4" />

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
            value={profileData.stats.totalLoansGiven}
            icon={TrendingUp}
            color="bg-blue-500"
          />
          <StatItem
            label="Loans Taken"
            value={profileData.stats.totalLoansTaken}
            icon={TrendingUp}
            color="bg-green-500"
          />
          <StatItem
            label="Successful Repayments"
            value={profileData.stats.successfulRepayments}
            icon={CheckCircle}
            color="bg-purple-500"
          />
          <StatItem
            label="Total Amount Lent"
            value={`₹${(profileData.stats.totalAmountLent / 1000).toFixed(0)}K`}
            icon={Award}
            color="bg-orange-500"
          />
        </div>
      </motion.div>

      {/* My Loans Section */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6">My Loan Requests</h2>
        
        {userLoans.length > 0 ? (
          <div className="space-y-4">
            {userLoans.map((loan: any) => (
              <div key={loan.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{loan.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{loan.description.substring(0, 100)}...</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>₹{loan.amount.toLocaleString()}</span>
                      <span>{loan.interest_rate}% interest</span>
                      <span>{loan.tenure_days} days</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      loan.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      loan.status === 'funded' ? 'bg-green-100 text-green-800' :
                      loan.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {loan.status}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {new Date(loan.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No loan requests yet</h3>
            <p className="text-gray-600">Start by posting your first loan request!</p>
          </div>
        )}
      </motion.div>

      {/* Legal Documents & Agreements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AgreementsSection />
      </motion.div>

      {/* Badges Section */}
      <motion.div
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">{t('profile.badges')}</h2>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-500">{profileData.badges.length} earned</div>
            <div className="relative">
              <Lightbulb 
                size={16} 
                className="text-yellow-500 cursor-help"
                onMouseEnter={() => setShowBadgeTooltip('criteria')}
                onMouseLeave={() => setShowBadgeTooltip(null)}
              />
              {showBadgeTooltip === 'criteria' && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs rounded-lg p-3 w-64 z-10">
                  <div className="font-semibold mb-2">Badge System:</div>
                  <div className="space-y-1">
                    <div>• Complete actions to earn badges</div>
                    <div>• Each badge gives you points</div>
                    <div>• Higher points = better reputation</div>
                    <div>• Hover over badges to see criteria</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {profileData.badges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profileData.badges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No badges yet</h3>
            <p className="text-gray-600">Start lending or borrowing to earn your first badge!</p>
            <div className="mt-4 text-sm text-gray-500">
              <div className="flex items-center justify-center space-x-1">
                <Lightbulb size={14} className="text-yellow-500" />
                <span>Tip: Complete identity verification to earn your first badge</span>
              </div>
            </div>
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
        <div className="flex items-center space-x-2 mb-6">
          <Settings size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Accessibility Settings</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{t('accessibility.voice_nav')}</h3>
              <p className="text-sm text-gray-600">Navigate using voice commands</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.accessibilitySettings.voiceNavigation}
                className="sr-only peer"
                readOnly
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
                checked={profileData.accessibilitySettings.highContrast}
                className="sr-only peer"
                readOnly
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
                checked={profileData.accessibilitySettings.screenReader}
                className="sr-only peer"
                readOnly
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
            {profileData.isVerified ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : (
              <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
            )}
            <span className={profileData.isVerified ? "text-green-800" : "text-gray-600"}>
              Identity Verified
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
            <span className="text-gray-600">Phone Verified</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
            <span className="text-gray-600">Bank Account Linked</span>
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