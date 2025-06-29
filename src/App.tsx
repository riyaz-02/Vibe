import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { useAuth } from './hooks/useAuth';
import { voiceManager } from './utils/voiceUtils';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
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
  const [appError, setAppError] = useState<string | null>(null);

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

  // Add error boundary
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('App error:', error);
      setAppError('Something went wrong. Please refresh the page.');
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  // Show error state
  if (appError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-500 text-2xl">⚠️</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
          <p className="text-gray-600 mb-4">{appError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show loading state with timeout
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Vibe...</p>
          <p className="text-sm text-gray-500 mt-1">Lend, Borrow, Connect – Vibe!</p>
          <div className="mt-4 text-xs text-gray-400">
            <p>Connecting to secure servers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar onAuthClick={() => setShowAuthModal(true)} />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/help" element={<Help />} />
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