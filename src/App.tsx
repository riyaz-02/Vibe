import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { useAuth } from './hooks/useAuth';
import { voiceManager } from './utils/voiceUtils';
import { supabase } from './lib/supabase';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import BoltAttribution from './components/Layout/BoltAttribution';
import HomePage from './components/Home/HomePage';
import Feed from './components/Feed/Feed';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import Help from './components/Help/Help';
import AuthModal from './components/Auth/AuthModal';
import ChatBot from './components/Chat/ChatBot';

function App() {
  const { isVoiceNavigationActive, currentLanguage } = useStore();
  const { loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Check if we're in demo mode (no Supabase connection)
    if (!supabase) {
      setDemoMode(true);
      console.log('🎯 Running in demo mode - Supabase not configured');
    }
  }, []);

  useEffect(() => {
    // Manage voice navigation
    if (isVoiceNavigationActive) {
      voiceManager.startListening();
    } else {
      voiceManager.stopListening();
    }
  }, [isVoiceNavigationActive]);

  // Set document language for accessibility
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Show loading state with timeout protection
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Loading Vibe...</h1>
          <p className="text-gray-600 mb-4">Lend, Borrow, Connect – Vibe!</p>
          
          <div className="max-w-md mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs">⚡</span>
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-blue-900 mb-1">Setting up your experience</h3>
                  <p className="text-sm text-blue-700">
                    {demoMode 
                      ? 'Running in demo mode with sample data'
                      : 'Connecting to secure servers...'
                    }
                  </p>
                </div>
              </div>
            </div>
            
            {demoMode && (
              <div className="text-xs text-gray-500">
                <p>💡 To enable full functionality:</p>
                <p>Configure your Supabase credentials in .env file</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Demo Mode Banner */}
        {demoMode && (
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border-b border-orange-200 px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-orange-600">🎯</span>
                  <p className="text-orange-800 text-sm">
                    <strong>Demo Mode:</strong> Running with sample data. 
                    <span className="hidden sm:inline"> To enable full functionality, configure your Supabase credentials.</span>
                  </p>
                </div>
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  Get Supabase →
                </a>
              </div>
            </div>
          </div>
        )}
        
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage onAuthClick={() => setShowAuthModal(true)} />} />
            <Route path="/feed" element={
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Feed />
              </div>
            } />
            <Route path="/dashboard" element={
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Dashboard />
              </div>
            } />
            <Route path="/profile" element={
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Profile />
              </div>
            } />
            <Route path="/help" element={
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Help />
              </div>
            } />
          </Routes>
        </main>
        
        <Footer />
        
        {/* Auth Modal */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        
        {/* AI Chatbot */}
        <ChatBot />
        
        {/* Bolt Attribution */}
        <BoltAttribution />
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;