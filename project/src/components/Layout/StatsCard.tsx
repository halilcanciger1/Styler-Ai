import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-white border border-stone-200 rounded-lg p-6 ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-stone-100 rounded-lg">
          <Icon className="w-5 h-5 text-stone-600" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-stone-900 mb-1">{value}</h3>
        <p className="text-stone-600 text-sm">{title}</p>
      </div>
    </motion.div>
  );
};

export default StatsCard;