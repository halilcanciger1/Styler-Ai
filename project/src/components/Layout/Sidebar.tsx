import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Palette, 
  Edit3, 
  Users, 
  Image, 
  FolderOpen, 
  Code2, 
  Settings,
  CreditCard,
  LogOut,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Studio', href: '/studio', icon: Palette },
  { name: 'Edit', href: '/edit', icon: Edit3, badge: 'NEW' },
  { name: 'Models', href: '/models', icon: Users },
  { name: 'Background', href: '/background', icon: Image },
  { name: 'My Gallery', href: '/gallery', icon: FolderOpen },
  { name: 'Developer API', href: '/api', icon: Code2 },
];

const Sidebar: React.FC = () => {
  const { user, profile, logout } = useAuthStore();

  return (
    <div className="flex flex-col h-full bg-stone-100 border-r border-stone-200">
      {/* Header */}
      <div className="p-4 border-b border-stone-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="font-bold text-stone-800">FASHNAI</span>
        </div>
      </div>

      {/* Current Plan */}
      <div className="p-4 border-b border-stone-200">
        <div className="text-xs text-stone-600 mb-1">
          Current plan: {profile?.subscription_tier?.toUpperCase() || 'FREE'}
        </div>
        <NavLink
          to="/subscription"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          Subscribe to a Plan
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-stone-200 text-stone-900'
                  : 'text-stone-600 hover:bg-stone-200 hover:text-stone-900'
              }`
            }
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.name}
            {item.badge && (
              <span className="ml-auto bg-yellow-400 text-stone-800 px-2 py-0.5 text-xs rounded-full">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      {user && profile && (
        <div className="p-4 border-t border-stone-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {profile.full_name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-stone-900 truncate">
                {profile.full_name || 'User'}
              </div>
              <div className="text-xs text-stone-500 truncate">
                {profile.email}
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <NavLink
              to="/settings"
              className="flex items-center px-3 py-2 text-sm text-stone-600 hover:bg-stone-200 hover:text-stone-900 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </NavLink>
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm text-stone-600 hover:bg-stone-200 hover:text-stone-900 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;