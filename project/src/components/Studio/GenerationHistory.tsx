import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Download, Eye, Trash2 } from 'lucide-react';
import { useGenerationStore } from '../../store/generationStore';
import { formatDistanceToNow } from 'date-fns';

const GenerationHistory: React.FC = () => {
  const { requests, removeRequest } = useGenerationStore();

  if (requests.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <div className="text-center">
          <Clock className="w-8 h-8 text-stone-400 mx-auto mb-3" />
          <h3 className="font-medium text-stone-900 mb-2">No History Yet</h3>
          <p className="text-stone-600 text-sm">Your generation history will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-stone-200">
        <h3 className="font-semibold text-stone-900">Recent Generations</h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {requests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 border-b border-stone-100 last:border-b-0 hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {/* Preview */}
              <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                {request.results && request.results[0] ? (
                  <img
                    src={request.results[0]}
                    alt="Generation result"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className={`w-3 h-3 rounded-full ${
                      request.status === 'completed' ? 'bg-green-500' :
                      request.status === 'processing' ? 'bg-yellow-500' :
                      request.status === 'failed' ? 'bg-red-500' : 'bg-stone-400'
                    }`}></div>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-stone-900 capitalize">
                    {request.category}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    request.status === 'completed' ? 'bg-green-100 text-green-800' :
                    request.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    request.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1">
                {request.status === 'completed' && (
                  <>
                    <button className="p-1.5 text-stone-400 hover:text-stone-600 rounded transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-stone-400 hover:text-stone-600 rounded transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => removeRequest(request.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GenerationHistory;