import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Image, 
  CreditCard, 
  Clock,
  Download,
  Heart,
  Share2,
  Eye,
  Zap,
  Users,
  Calendar
} from 'lucide-react';
import StatsCard from '../components/Layout/StatsCard';
import UsageChart from '../components/Analytics/UsageChart';
import { useAuthStore } from '../store/authStore';
import { useGenerationStore } from '../store/generationStore';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { profile } = useAuthStore();
  const { generations } = useGenerationStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [usageData, setUsageData] = useState<any[]>([]);

  useEffect(() => {
    if (profile) {
      fetchAnalytics();
      fetchUsageData();
    }
  }, [profile]);

  const fetchAnalytics = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchUsageData = async () => {
    if (!profile) return;

    try {
      // Fetch last 7 days of usage
      const { data, error } = await supabase
        .from('generations')
        .select('created_at, status')
        .eq('user_id', profile.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped = data?.reduce((acc: any, gen) => {
        const date = new Date(gen.created_at).toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { date, generations: 0, credits_used: 0 };
        }
        acc[date].generations += 1;
        if (gen.status === 'completed') {
          acc[date].credits_used += 1;
        }
        return acc;
      }, {});

      setUsageData(Object.values(grouped || {}));
    } catch (error) {
      console.error('Error fetching usage data:', error);
    }
  };

  const completedGenerations = generations.filter(g => g.status === 'completed').length;
  const totalGenerations = generations.length;
  const successRate = totalGenerations > 0 ? (completedGenerations / totalGenerations) * 100 : 0;

  const recentResults = generations
    .filter(g => g.status === 'completed' && g.result_urls)
    .slice(0, 6);

  const getSubscriptionColor = () => {
    switch (profile?.subscription_tier) {
      case 'basic': return 'text-blue-600';
      case 'pro': return 'text-yellow-600';
      case 'enterprise': return 'text-purple-600';
      default: return 'text-stone-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Welcome back, {profile?.full_name}!
        </h1>
        <p className="text-stone-600">
          Here's what's happening with your AI fashion generations
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Generations"
          value={analytics?.completed_generations || totalGenerations}
          icon={Image}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Success Rate"
          value={`${Math.round(successRate)}%`}
          icon={TrendingUp}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Credits Remaining"
          value={profile?.credits || 0}
          icon={Zap}
        />
        <StatsCard
          title="Active Days"
          value={analytics?.active_days || 0}
          icon={Calendar}
          trend={{ value: 8, isPositive: true }}
        />
      </div>

      {/* Analytics Charts */}
      {usageData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UsageChart data={usageData} type="line" />
          <UsageChart data={usageData} type="bar" />
        </div>
      )}

      {/* Account Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Recent Results */}
          <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-stone-900">Recent Results</h2>
                <Link
                  to="/gallery"
                  className="text-yellow-600 hover:text-yellow-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>

            {recentResults.length > 0 ? (
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {recentResults.map((generation, index) => (
                    <motion.div
                      key={generation.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group relative"
                    >
                      <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden">
                        <img
                          src={generation.result_urls![0]}
                          alt="Generated result"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-1">
                          <button className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors">
                            <Eye className="w-3 h-3 text-stone-700" />
                          </button>
                          <button className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors">
                            <Download className="w-3 h-3 text-stone-700" />
                          </button>
                          <button className="p-1.5 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors">
                            <Heart className="w-3 h-3 text-stone-700" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Image className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 mb-2">No results yet</h3>
                <p className="text-stone-600 mb-4">Start generating your first fashion visualization</p>
                <Link
                  to="/studio"
                  className="bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Go to Studio
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="space-y-6">
          {/* Subscription Status */}
          <div className="bg-white border border-stone-200 rounded-lg p-6">
            <h3 className="font-semibold text-stone-900 mb-4">Subscription</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Current Plan</span>
                <span className={`font-medium capitalize ${getSubscriptionColor()}`}>
                  {profile?.subscription_tier || 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Credits</span>
                <span className="font-medium text-stone-900">
                  {profile?.credits || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Total Generations</span>
                <span className="font-medium text-stone-900">
                  {profile?.total_generations || 0}
                </span>
              </div>
            </div>
            <Link
              to="/subscription"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center mt-4"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-stone-200 rounded-lg p-6">
            <h3 className="font-semibold text-stone-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Avg. Processing Time</span>
                <span className="font-medium text-stone-900">
                  {analytics?.avg_processing_time ? `${Math.round(analytics.avg_processing_time / 1000)}s` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Last Generation</span>
                <span className="font-medium text-stone-900">
                  {analytics?.last_generation_at 
                    ? new Date(analytics.last_generation_at).toLocaleDateString()
                    : 'Never'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Success Rate</span>
                <span className="font-medium text-green-600">
                  {Math.round(successRate)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/studio">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-6 text-stone-800 cursor-pointer"
          >
            <h3 className="font-semibold mb-2">Start New Generation</h3>
            <p className="text-sm opacity-90">Upload model and garment images to create stunning visualizations</p>
          </motion.div>
        </Link>

        <Link to="/gallery">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-stone-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-stone-900 mb-2">Browse Gallery</h3>
            <p className="text-stone-600 text-sm">View and manage your generated fashion visualizations</p>
          </motion.div>
        </Link>

        <Link to="/subscription">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-stone-200 rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-stone-900 mb-2">Upgrade Plan</h3>
            <p className="text-stone-600 text-sm">Get more credits and unlock premium features</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;