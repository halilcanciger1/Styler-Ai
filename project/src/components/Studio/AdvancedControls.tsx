import React from 'react';
import { ChevronDown, ChevronUp, Shuffle } from 'lucide-react';

interface AdvancedControlsProps {
  isExpanded: boolean;
  onToggle: () => void;
  samples: number;
  onSamplesChange: (samples: number) => void;
  seed: number | undefined;
  onSeedChange: (seed: number | undefined) => void;
  quality: 'performance' | 'balanced' | 'quality';
  onQualityChange: (quality: 'performance' | 'balanced' | 'quality') => void;
}

const AdvancedControls: React.FC<AdvancedControlsProps> = ({
  isExpanded,
  onToggle,
  samples,
  onSamplesChange,
  seed,
  onSeedChange,
  quality,
  onQualityChange,
}) => {
  const generateRandomSeed = () => {
    onSeedChange(Math.floor(Math.random() * 1000000));
  };

  return (
    <div className="border border-stone-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-stone-700 font-medium transition-colors"
      >
        <span>Advanced</span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* Quality Controls */}
          <div className="space-y-4">
            <div className="flex space-x-2">
              {['performance', 'balanced', 'quality'].map((q) => (
                <button
                  key={q}
                  onClick={() => onQualityChange(q as typeof quality)}
                  className={`
                    flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                    ${quality === q
                      ? q === 'performance' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : q === 'balanced'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-green-100 text-green-800 border border-green-200'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                    }
                  `}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Samples Control */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">
              No. of Samples
            </label>
            <input
              type="number"
              min="1"
              max="4"
              value={samples}
              onChange={(e) => onSamplesChange(Math.max(1, Math.min(4, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Seed Control */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">
              Seed
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                value={seed || ''}
                onChange={(e) => onSeedChange(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Random"
                className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <button
                onClick={generateRandomSeed}
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors"
              >
                <Shuffle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedControls;