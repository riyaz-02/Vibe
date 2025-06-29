import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useStore } from './store/useStore';
import { useAuth } from './hooks/useAuth';
import { voiceManager } from './utils/voiceUtils';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import Feed from './components/Feed/Feed';
import Dashboard from './components/Dashboard/Dashboard';
import Profile from './components/Profile/Profile';
import Help from './components/Help/Help';
import SubscriptionPage from './components/Subscription/SubscriptionPage';
import SuccessPage from './components/Subscription/SuccessPage';

function App() {
  const { user, loading } = useAuth();
  const { isVoiceNavigationActive, currentLanguage } = useStore();

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">LC</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {user && <Navbar />}
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" replace /> : <LoginPage />} 
            />
            <Route 
              path="/signup" 
              element={user ? <Navigate to="/" replace /> : <SignupPage />} 
            />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Feed />
                </div>
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
            
            <Route path="/help" element={
              <ProtectedRoute>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <Help />
                </div>
              </ProtectedRoute>
            } />
            
            <Route path="/subscription" element={
              <ProtectedRoute>
                <SubscriptionPage />
              </ProtectedRoute>
            } />
            
            <Route path="/subscription/success" element={
              <ProtectedRoute>
                <SuccessPage />
              </ProtectedRoute>
            } />

            {/* Redirect to login if not authenticated */}
            <Route path="*" element={
              user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
            } />
          </Routes>
        </main>
        
        {user && <Footer />}
        
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