import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Camera, Save } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { uploadFile, STORAGE_BUCKETS } from '../../lib/supabase';
import toast from 'react-hot-toast';

const ProfileSettings: React.FC = () => {
  const { profile, updateProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setIsLoading(true);
    try {
      const fileName = `${profile.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const avatarUrl = await uploadFile(STORAGE_BUCKETS.AVATARS, fileName, file);
      
      await updateProfile({ avatar_url: avatarUrl });
      toast.success('Avatar updated successfully!');
    } catch (error) {
      toast.error('Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsLoading(true);
    try {
      await updateProfile({
        full_name: formData.full_name,
        email: formData.email,
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-200 rounded-lg p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">Profile Settings</h3>
        <p className="text-stone-600 text-sm">Manage your account information</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-20 h-20 bg-stone-100 rounded-full overflow-hidden">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-stone-400" />
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 bg-yellow-400 hover:bg-yellow-500 text-stone-800 p-2 rounded-full cursor-pointer transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h4 className="font-medium text-stone-900">Profile Picture</h4>
            <p className="text-stone-600 text-sm">Upload a new avatar for your account</p>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-stone-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
            placeholder="Enter your full name"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 pl-12 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
            />
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-stone-50 rounded-lg">
          <div>
            <div className="text-2xl font-bold text-stone-900">{profile.credits}</div>
            <div className="text-stone-600 text-sm">Credits Remaining</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-stone-900 capitalize">{profile.subscription_tier}</div>
            <div className="text-stone-600 text-sm">Current Plan</div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-stone-800 font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <Save className="w-5 h-5 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </motion.div>
  );
};

export default ProfileSettings;