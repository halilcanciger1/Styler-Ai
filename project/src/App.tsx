import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Notifications from './components/Layout/Notifications';
import BuyCreditsButton from './components/Pricing/BuyCreditsButton';
import PricingModal from './components/Pricing/PricingModal';
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

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-stone-900 mb-2">Something went wrong</h1>
            <p className="text-stone-600 mb-4">
              We're sorry, but there was an error loading the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Reload Page
            </button>
            {this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-stone-500 text-sm">Error Details</summary>
                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  useEffect(() => {
    // Add error handling for initialization
    const initializeApp = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();
  }, [initialize]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const setupRealtime = async () => {
        try {
          await fetchGenerations();
          subscribeToRealtime(user.id);
        } catch (error) {
          console.error('Failed to setup realtime:', error);
        }
      };

      setupRealtime();
      
      return () => {
        try {
          unsubscribeFromRealtime();
        } catch (error) {
          console.error('Failed to unsubscribe from realtime:', error);
        }
      };
    }
  }, [isAuthenticated, user, fetchGenerations, subscribeToRealtime, unsubscribeFromRealtime]);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleBuyCreditsClick = () => {
    setIsPricingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-stone-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-600 mt-2">Loading FASHNAI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
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
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
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
                {/* Catch all route for 404s */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>

          {/* Buy Credits Button - Fixed Position */}
          <BuyCreditsButton onClick={handleBuyCreditsClick} />

          {/* Pricing Modal */}
          <PricingModal 
            isOpen={isPricingModalOpen} 
            onClose={() => setIsPricingModalOpen(false)} 
          />

          {/* Notifications */}
          <Notifications 
            notifications={notifications} 
            onRemove={removeNotification} 
          />

          <Toaster position="top-right" />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;