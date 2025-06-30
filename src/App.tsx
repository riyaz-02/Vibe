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
import Plans from './components/Pages/Plans';
import About from './components/Pages/About';
import Contact from './components/Pages/Contact';
import SuccessPage from './components/Pages/SuccessPage';
import AuthModal from './components/Auth/AuthModal';
import ChatBot from './components/Chat/ChatBot';
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  const { isVoiceNavigationActive, currentLanguage } = useStore();
  const { loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

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
                    Connecting to secure servers...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage onAuthClick={() => setShowAuthModal(true)} />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/help" element={
              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Help />
              </div>
            } />
            
            {/* Protected Routes */}
            <Route path="/feed" element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Dashboard />
                </div>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Profile />
                </div>
              </ProtectedRoute>
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