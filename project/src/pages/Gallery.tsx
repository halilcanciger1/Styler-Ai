import React from 'react';
import { Download, Share2, Trash2, Eye } from 'lucide-react';
import { useGenerationStore } from '../store/generationStore';

const Gallery: React.FC = () => {
  const { requests } = useGenerationStore();

  const completedRequests = requests.filter(req => req.status === 'completed' && req.results);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">My Gallery</h1>
        <p className="text-stone-600">View and manage your generated fashion visualizations</p>
      </div>

      {completedRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-stone-100 rounded-lg flex items-center justify-center mb-4">
            <Eye className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">No results yet</h3>
          <p className="text-stone-600 mb-4">Generate your first fashion visualization in the Studio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-stone-100">
                {request.results && request.results[0] && (
                  <img
                    src={request.results[0]}
                    alt="Generated result"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-stone-700 capitalize">
                    {request.category}
                  </span>
                  <span className="text-xs text-stone-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;