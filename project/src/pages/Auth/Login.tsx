import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      // Check if it's a Supabase auth error with email not confirmed
      if (error?.message?.includes('Email not confirmed') || 
          error?.code === 'email_not_confirmed' ||
          (error?.body && JSON.parse(error.body)?.code === 'email_not_confirmed')) {
        toast.error('Please check your email and click the confirmation link before signing in.');
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-stone-800 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Welcome back</h1>
          <p className="text-stone-600 mt-2">Sign in to your FASHNAI account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-yellow-500 border-stone-300 rounded focus:ring-yellow-500"
              />
              <span className="ml-2 text-sm text-stone-600">Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm text-yellow-600 hover:text-yellow-700">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-300 text-stone-800 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-stone-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-yellow-600 hover:text-yellow-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;