import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Heart, RotateCcw, Maximize2 } from 'lucide-react';
import { useGenerationStore } from '../../store/generationStore';

const ResultsPanel: React.FC = () => {
  const { requests, isGenerating } = useGenerationStore();
  const latestRequest = requests[0];

  if (!latestRequest && !isGenerating) {
    return null;
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-stone-200">
        <h3 className="font-semibold text-stone-900">Results</h3>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="aspect-square bg-stone-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-stone-600 text-sm">Generating your fashion visualization...</p>
                  <p className="text-stone-500 text-xs mt-1">This usually takes 3-5 seconds</p>
                </div>
              </div>
            </motion.div>
          ) : latestRequest?.results ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                {latestRequest.results.map((result, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden">
                      <img
                        src={result}
                        alt={`Generated result ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Overlay Controls */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors">
                          <Maximize2 className="w-4 h-4 text-stone-700" />
                        </button>
                        <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors">
                          <Download className="w-4 h-4 text-stone-700" />
                        </button>
                        <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors">
                          <Share2 className="w-4 h-4 text-stone-700" />
                        </button>
                        <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors">
                          <Heart className="w-4 h-4 text-stone-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </button>
                <button className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors flex items-center">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Regenerate
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResultsPanel;