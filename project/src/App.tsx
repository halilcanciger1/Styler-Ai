import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Notifications from './components/Layout/Notifications';
import Dashboard from './pages/Dashboard';
import Studio from './pages/Studio';
import Gallery from './pages/Gallery';
import Subscription from './pages/Subscription';
import ApiDocs from './pages/ApiDocs';
import Settings from './pages/Settings';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import { useAuthStore } from './store/authStore';
import { useGenerationStore } from './store/generationStore';

function App() {
  const { isAuthenticated, isLoading, initialize, user } = useAuthStore();
  const { subscribeToRealtime, unsubscribeFromRealtime, fetchGenerations } = useGenerationStore();
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      type: 'success' as const,
      title: 'Welcome to FASHNAI',
      message: 'Your AI-powered fashion platform is ready to use!',
      timestamp: '1 minute ago',
    },
  ]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchGenerations();
      subscribeToRealtime(user.id);
      
      return () => {
        unsubscribeFromRealtime();
      };
    }
  }, [isAuthenticated, user, fetchGenerations, subscribeToRealtime, unsubscribeFromRealtime]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-stone-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <div className="min-h-screen bg-stone-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 flex">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/api" element={<ApiDocs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/edit" element={<div className="p-6">Edit page coming soon...</div>} />
              <Route path="/models" element={<div className="p-6">Models page coming soon...</div>} />
              <Route path="/background" element={<div className="p-6">Background page coming soon...</div>} />
            </Routes>
          </main>
        </div>

        {/* Notifications */}
        <Notifications 
          notifications={notifications} 
          onRemove={removeNotification} 
        />

        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;