import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Heart, RotateCcw, Maximize2 } from 'lucide-react';
import { useGenerationStore } from '../../store/generationStore';

const ResultsPanel: React.FC = () => {
  const { generations } = useGenerationStore();
  
  // Get the most recent completed generation with results
  const latestGeneration = generations?.find(g => 
    g.status === 'completed' && g.result_urls && g.result_urls.length > 0
  );

  // Check if any generation is currently processing
  const isGenerating = generations?.some(g => g.status === 'processing') || false;

  if (!latestGeneration && !isGenerating) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <h3 className="font-semibold text-stone-900 mb-4">Results</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto bg-stone-100 rounded-lg flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-stone-300 border-dashed rounded"></div>
          </div>
          <h4 className="font-medium text-stone-900 mb-2">No results yet</h4>
          <p className="text-stone-600 text-sm">Your generated images will appear here</p>
        </div>
      </div>
    );
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
          ) : latestGeneration?.result_urls ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4">
                {latestGeneration.result_urls.map((result, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-stone-100 rounded-lg overflow-hidden">
                      <img
                        src={result}
                        alt={`Generated result ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Failed to load image:', result);
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIGZhaWxlZCB0byBsb2FkPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                    </div>
                    
                    {/* Overlay Controls */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => window.open(result, '_blank')}
                          className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors"
                        >
                          <Maximize2 className="w-4 h-4 text-stone-700" />
                        </button>
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = result;
                            link.download = `fashion-ai-result-${index + 1}.jpg`;
                            link.click();
                          }}
                          className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors"
                        >
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

              {/* Generation Info */}
              <div className="bg-stone-50 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-600">Category:</span>
                  <span className="text-stone-900 capitalize">{latestGeneration.category}</span>
                </div>
                {latestGeneration.processing_time && (
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-stone-600">Processing Time:</span>
                    <span className="text-stone-900">{(latestGeneration.processing_time / 1000).toFixed(1)}s</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-stone-600">Generated:</span>
                  <span className="text-stone-900">
                    {new Date(latestGeneration.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button 
                  onClick={() => {
                    latestGeneration.result_urls?.forEach((url, index) => {
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `fashion-ai-result-${index + 1}.jpg`;
                      link.click();
                    });
                  }}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
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