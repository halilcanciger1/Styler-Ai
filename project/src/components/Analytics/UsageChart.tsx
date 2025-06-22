import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';

interface UsageChartProps {
  data: Array<{
    date: string;
    generations: number;
    credits_used: number;
  }>;
  type?: 'line' | 'bar';
}

const UsageChart: React.FC<UsageChartProps> = ({ data, type = 'line' }) => {
  const Chart = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-200 rounded-lg p-6"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-stone-900 mb-2">Usage Analytics</h3>
        <p className="text-stone-600 text-sm">Track your generation activity over time</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <DataComponent
              {...(type === 'line' 
                ? {
                    type: 'monotone',
                    dataKey: 'generations',
                    stroke: '#f59e0b',
                    strokeWidth: 3,
                    dot: { fill: '#f59e0b', strokeWidth: 2, r: 4 },
                    activeDot: { r: 6, stroke: '#f59e0b', strokeWidth: 2 }
                  }
                : {
                    dataKey: 'generations',
                    fill: '#f59e0b',
                    radius: [4, 4, 0, 0]
                  }
              )}
            />
            <DataComponent
              {...(type === 'line'
                ? {
                    type: 'monotone',
                    dataKey: 'credits_used',
                    stroke: '#ef4444',
                    strokeWidth: 2,
                    strokeDasharray: '5 5',
                    dot: { fill: '#ef4444', strokeWidth: 2, r: 3 }
                  }
                : {
                    dataKey: 'credits_used',
                    fill: '#ef4444',
                    radius: [4, 4, 0, 0]
                  }
              )}
            />
          </Chart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-sm text-stone-600">Generations</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm text-stone-600">Credits Used</span>
        </div>
      </div>
    </motion.div>
  );
};

export default UsageChart;