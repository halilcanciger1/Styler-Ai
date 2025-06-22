import React from 'react';
import { Bell, Settings, User, CreditCard, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { profile } = useAuthStore();

  const getCreditColor = () => {
    if (!profile) return 'text-stone-600';
    if (profile.credits <= 5) return 'text-red-600';
    if (profile.credits <= 20) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getSubscriptionBadge = () => {
    if (!profile) return null;
    
    const colors = {
      free: 'bg-stone-100 text-stone-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-yellow-100 text-yellow-800',
      enterprise: 'bg-purple-100 text-purple-800',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[profile.subscription_tier as keyof typeof colors] || colors.free}`}>
        {profile.subscription_tier.toUpperCase()}
      </span>
    );
  };

  return (
    <header className="bg-white border-b border-stone-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-stone-900">
            Welcome back, {profile?.full_name || 'User'}
          </h1>
          <div className="flex items-center space-x-4 mt-1">
            <div className="flex items-center space-x-2">
              <Zap className={`w-4 h-4 ${getCreditColor()}`} />
              <span className={`text-sm font-medium ${getCreditColor()}`}>
                {profile?.credits || 0} credits remaining
              </span>
            </div>
            {getSubscriptionBadge()}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Link
              to="/subscription"
              className="bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              <CreditCard className="w-4 h-4 mr-1" />
              Upgrade
            </Link>
          </div>

          {/* Notifications */}
          <button className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <Link
            to="/settings"
            className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>

          {/* Profile */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-medium text-sm">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-stone-900">
                {profile?.full_name || 'User'}
              </div>
              <div className="text-xs text-stone-500">
                {profile?.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;