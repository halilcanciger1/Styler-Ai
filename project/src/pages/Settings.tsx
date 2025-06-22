import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, CreditCard, Key, Trash2 } from 'lucide-react';
import ProfileSettings from '../components/Settings/ProfileSettings';
import UsageChart from '../components/Analytics/UsageChart';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api', label: 'API Keys', icon: Key },
    { id: 'analytics', label: 'Analytics', icon: CreditCard },
  ];

  const mockUsageData = [
    { date: '2024-01-01', generations: 5, credits_used: 5 },
    { date: '2024-01-02', generations: 8, credits_used: 8 },
    { date: '2024-01-03', generations: 12, credits_used: 12 },
    { date: '2024-01-04', generations: 6, credits_used: 6 },
    { date: '2024-01-05', generations: 15, credits_used: 15 },
    { date: '2024-01-06', generations: 9, credits_used: 9 },
    { date: '2024-01-07', generations: 11, credits_used: 11 },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Settings</h1>
        <p className="text-stone-600">Manage your account preferences and settings</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-64">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'profile' && <ProfileSettings />}
            
            {activeTab === 'notifications' && (
              <div className="bg-white border border-stone-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-stone-900">Generation Complete</h4>
                      <p className="text-stone-600 text-sm">Get notified when your AI generation is complete</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-stone-900">Low Credits</h4>
                      <p className="text-stone-600 text-sm">Alert when you have less than 5 credits remaining</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-stone-900">Marketing Updates</h4>
                      <p className="text-stone-600 text-sm">Receive updates about new features and promotions</p>
                    </div>
                    <input type="checkbox" className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white border border-stone-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">Password</h3>
                  <button className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2 rounded-lg transition-colors">
                    Change Password
                  </button>
                </div>
                
                <div className="bg-white border border-stone-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">Two-Factor Authentication</h3>
                  <p className="text-stone-600 mb-4">Add an extra layer of security to your account</p>
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg transition-colors">
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <UsageChart data={mockUsageData} type="line" />
                <UsageChart data={mockUsageData} type="bar" />
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="bg-white border border-stone-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-stone-900 mb-4">Billing Information</h3>
                <p className="text-stone-600">Manage your subscription and billing details</p>
                <div className="mt-4">
                  <button className="bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg transition-colors mr-3">
                    Upgrade Plan
                  </button>
                  <button className="border border-stone-300 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors">
                    View Invoices
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;