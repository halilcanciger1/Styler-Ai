import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Trash2, Eye, Search, Grid3X3, List, Calendar, X, Maximize2, Heart, FolderOpen } from 'lucide-react';
import { useGenerationStore } from '../store/generationStore';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface GalleryImage {
  id: string;
  url: string;
  name: string;
  created_at: string;
  category: string;
  generation_id: string;
  processing_time?: number;
}

const Gallery: React.FC = () => {
  const { generations } = useGenerationStore();
  const { profile } = useAuthStore();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  const categories = ['all', 'tops', 'bottoms', 'full-body'];

  useEffect(() => {
    fetchImages();
  }, [generations]);

  useEffect(() => {
    filterAndSortImages();
  }, [images, searchTerm, selectedCategory, sortBy, sortOrder]);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const allImages: GalleryImage[] = [];

      // Get only generated results from completed generations
      generations
        .filter(gen => gen.status === 'completed' && gen.result_urls && gen.result_urls.length > 0)
        .forEach(gen => {
          gen.result_urls?.forEach((url, index) => {
            allImages.push({
              id: `${gen.id}-result-${index}`,
              url,
              name: `Generated Result ${index + 1}`,
              created_at: gen.created_at,
              category: gen.category,
              generation_id: gen.id,
              processing_time: gen.processing_time
            });
          });
        });

      setImages(allImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortImages = () => {
    let filtered = [...images];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(img =>
        img.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        img.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(img => img.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredImages(filtered);
  };

  const downloadImage = async (image: GalleryImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${image.name.replace(/\s+/g, '_')}_${new Date().getTime()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download image');
    }
  };

  const downloadSelectedImages = async () => {
    if (selectedImages.size === 0) {
      toast.error('No images selected');
      return;
    }

    const imagesToDownload = filteredImages.filter(img => selectedImages.has(img.id));
    
    for (const image of imagesToDownload) {
      await downloadImage(image);
      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setSelectedImages(new Set());
    toast.success(`Downloaded ${imagesToDownload.length} images`);
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      // Remove from local state
      setImages(prev => prev.filter(img => img.id !== imageId));
      setSelectedImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
      toast.success('Image deleted successfully');
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete image');
    }
  };

  const shareImage = async (image: GalleryImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.name,
          text: `Check out this AI-generated fashion image`,
          url: image.url,
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(image.url);
      }
    } else {
      copyToClipboard(image.url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Image URL copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const selectAllImages = () => {
    setSelectedImages(new Set(filteredImages.map(img => img.id)));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-stone-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 mb-2">My Gallery</h1>
            <p className="text-stone-600">
              {filteredImages.length} generated results
              {selectedImages.size > 0 && ` • ${selectedImages.size} selected`}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedImages.size > 0 && (
              <>
                <button
                  onClick={downloadSelectedImages}
                  className="bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Selected ({selectedImages.size})
                </button>
                <button
                  onClick={clearSelection}
                  className="text-stone-600 hover:text-stone-800 px-3 py-2 rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </>
            )}
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search generated results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort Options */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy as 'date' | 'category');
              setSortOrder(newSortOrder as 'asc' | 'desc');
            }}
            className="px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="category-asc">Category A-Z</option>
            <option value="category-desc">Category Z-A</option>
          </select>
        </div>

        {/* Quick Actions */}
        {filteredImages.length > 0 && (
          <div className="flex items-center space-x-2 mt-4">
            <button
              onClick={selectAllImages}
              className="text-sm px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              className="text-sm px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Gallery Content */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-stone-100 rounded-lg flex items-center justify-center mb-4">
            {searchTerm || selectedCategory !== 'all' ? (
              <Search className="w-8 h-8 text-stone-400" />
            ) : (
              <FolderOpen className="w-8 h-8 text-stone-400" />
            )}
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">
            {searchTerm || selectedCategory !== 'all' ? 'No results found' : 'No generated results yet'}
          </h3>
          <p className="text-stone-600 mb-4">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters' 
              : 'Generate your first fashion visualization in the Studio'
            }
          </p>
          {!searchTerm && selectedCategory === 'all' && (
            <button className="bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-6 py-3 rounded-lg font-medium transition-colors">
              Go to Studio
            </button>
          )}
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' 
            : 'space-y-4'
          }
        `}>
          <AnimatePresence>
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  bg-white rounded-lg border border-stone-200 overflow-hidden hover:shadow-lg transition-all group
                  ${selectedImages.has(image.id) ? 'ring-2 ring-yellow-400' : ''}
                  ${viewMode === 'list' ? 'flex items-center p-4' : ''}
                `}
              >
                {viewMode === 'grid' ? (
                  <>
                    {/* Grid View */}
                    <div className="relative">
                      <div className="aspect-square bg-stone-100 overflow-hidden">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIGZhaWxlZCB0byBsb2FkPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      </div>
                      
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedImages.has(image.id)}
                          onChange={() => toggleImageSelection(image.id)}
                          className="w-4 h-4 text-yellow-500 border-stone-300 rounded focus:ring-yellow-500"
                        />
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800">
                          {image.category}
                        </span>
                      </div>

                      {/* Overlay Controls */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setSelectedImage(image)}
                            className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors"
                          >
                            <Maximize2 className="w-4 h-4 text-stone-700" />
                          </button>
                          <button
                            onClick={() => downloadImage(image)}
                            className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors"
                          >
                            <Download className="w-4 h-4 text-stone-700" />
                          </button>
                          <button
                            onClick={() => shareImage(image)}
                            className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors"
                          >
                            <Share2 className="w-4 h-4 text-stone-700" />
                          </button>
                          <button
                            onClick={() => deleteImage(image.id)}
                            className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-stone-900 truncate mb-1">{image.name}</h3>
                      <p className="text-stone-600 text-sm mb-2">
                        {new Date(image.created_at).toLocaleDateString()}
                      </p>
                      
                      {/* Processing Time */}
                      {image.processing_time && (
                        <p className="text-stone-500 text-xs">
                          Generated in {(image.processing_time / 1000).toFixed(1)}s
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* List View */}
                    <div className="flex items-center space-x-4 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedImages.has(image.id)}
                        onChange={() => toggleImageSelection(image.id)}
                        className="w-4 h-4 text-yellow-500 border-stone-300 rounded focus:ring-yellow-500"
                      />
                      
                      <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={image.url}
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-stone-900 truncate">{image.name}</h3>
                        <p className="text-stone-600 text-sm">
                          {image.category} • {new Date(image.created_at).toLocaleDateString()}
                        </p>
                        {image.processing_time && (
                          <p className="text-stone-500 text-xs">
                            Generated in {(image.processing_time / 1000).toFixed(1)}s
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setSelectedImage(image)}
                          className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadImage(image)}
                          className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => shareImage(image)}
                          className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteImage(image.id)}
                          className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Full Size Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Image Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
                <h3 className="font-medium mb-2">{selectedImage.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="text-sm opacity-90">
                    {selectedImage.category} • {new Date(selectedImage.created_at).toLocaleDateString()}
                    {selectedImage.processing_time && (
                      <span> • Generated in {(selectedImage.processing_time / 1000).toFixed(1)}s</span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => downloadImage(selectedImage)}
                      className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => shareImage(selectedImage)}
                      className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;