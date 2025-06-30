import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, User, HelpCircle, Mic, MicOff, Globe, Bell, LogIn, Zap, Menu, CreditCard, Users, Phone, Crown } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useAuth } from '../../hooks/useAuth';
import { useStripe } from '../../hooks/useStripe';
import { useTranslation } from '../../utils/translations';
import { motion } from 'framer-motion';

interface NavbarProps {
  onAuthClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthClick }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { subscription } = useStripe();
  const { 
    currentLanguage, 
    setCurrentLanguage,
    isVoiceNavigationActive, 
    toggleVoiceNavigation,
    notifications,
    currentUser 
  } = useStore();
  
  const t = useTranslation(currentLanguage);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigation items for authenticated users
  const authenticatedNavItems = [
    { path: '/feed', icon: LayoutDashboard, label: 'Feed' },
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.dashboard') },
    { path: '/profile', icon: User, label: t('nav.profile') },
    { path: '/help', icon: HelpCircle, label: t('nav.help') }
  ];

  // Navigation items for non-authenticated users
  const publicNavItems = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/plans', icon: CreditCard, label: 'Plans' },
    { path: '/about', icon: Users, label: 'About Us' },
    { path: '/contact', icon: Phone, label: 'Contact Us' },
    { path: '/help', icon: HelpCircle, label: t('nav.help') }
  ];

  const navItems = user ? authenticatedNavItems : publicNavItems;

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'hinglish', label: 'Hinglish' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'es', label: 'Español' },
    { code: 'zh', label: '中文' }
  ];

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  const handleSignOut = async () => {
    await signOut();
  };

  // Get subscription status for display
  const getSubscriptionDisplay = () => {
    if (!subscription) return null;
    
    if (subscription.subscription_status === 'active') {
      return (
        <div className="flex items-center space-x-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
          <Crown size={12} />
          <span>Pro</span>
        </div>
      );
    }
    
    return null;
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="https://i.postimg.cc/3NkJPPCj/4310527d-e957-40f6-b9e8-eefdb06219f3-1.png" 
              alt="Vibe Logo" 
              className="h-10 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                {t('app.title')}
              </span>
              <span className="text-xs text-gray-500 -mt-1 hidden sm:block">
                {t('app.tagline')}
              </span>
            </div>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-label={item.label}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-6 h-0.5 bg-blue-600 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      style={{ translateX: '-50%' }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative group">
              <button
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                aria-label="Change Language"
              >
                <Globe size={20} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.code as any)}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      currentLanguage === lang.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Navigation Toggle - Only for authenticated users */}
            {user && (
              <button
                onClick={toggleVoiceNavigation}
                className={`p-2 rounded-lg transition-colors ${
                  isVoiceNavigationActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
                aria-label={t('accessibility.voice_nav')}
              >
                {isVoiceNavigationActive ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
            )}

            {user ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                  <Bell size={20} />
                  {unreadNotifications > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {unreadNotifications}
                    </motion.span>
                  )}
                </button>

                {/* User Menu */}
                <div className="relative group">
                  <div className="flex items-center space-x-2 cursor-pointer">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={currentUser?.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'}
                        alt={currentUser?.name || 'User'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {getSubscriptionDisplay()}
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="font-medium text-gray-900">{currentUser?.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {getSubscriptionDisplay() && (
                        <div className="mt-1">
                          {getSubscriptionDisplay()}
                        </div>
                      )}
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      View Profile
                    </Link>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/plans"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                      Upgrade Plan
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-b-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-teal-600 transition-all duration-200"
              >
                <LogIn size={18} />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden border-t border-gray-200 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="flex flex-col py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-4 py-3 ${
                  isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/plans"
            className="flex items-center space-x-2 px-4 py-3 text-gray-600"
            onClick={() => setMobileMenuOpen(false)}
          >
            <CreditCard size={20} />
            <span className="font-medium">Plans</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;