import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Star, Download, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';

interface Template {
  id: string;
  name: string;
  description: string | null;
  category: string;
  model_image_url: string;
  garment_image_url: string;
  result_image_url: string | null;
  tags: string[];
  is_public: boolean;
  created_by: string | null;
  usage_count: number;
  rating: number;
  created_at: string;
}

const TemplateManager: React.FC = () => {
  const { profile } = useAuthStore();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showMyTemplates, setShowMyTemplates] = useState(false);

  const categories = ['all', 'tops', 'bottoms', 'full-body', 'accessories'];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory, showMyTemplates]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by ownership
    if (showMyTemplates && profile) {
      filtered = filtered.filter(template => template.created_by === profile.id);
    }

    setFilteredTemplates(filtered);
  };

  const useTemplate = async (template: Template) => {
    try {
      // Increment usage count
      await supabase
        .from('templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template.id);

      // Trigger template usage (you can emit an event or call a callback)
      toast.success(`Template "${template.name}" loaded successfully!`);
      
      // Refresh templates to update usage count
      fetchTemplates();
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to use template');
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      
      toast.success('Template deleted successfully');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const togglePublic = async (template: Template) => {
    try {
      const { error } = await supabase
        .from('templates')
        .update({ is_public: !template.is_public })
        .eq('id', template.id);

      if (error) throw error;
      
      toast.success(`Template ${template.is_public ? 'made private' : 'made public'}`);
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template visibility:', error);
      toast.error('Failed to update template');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-stone-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-stone-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Template Gallery</h2>
          <p className="text-stone-600">Browse and manage fashion templates</p>
        </div>
        <button className="bg-yellow-400 hover:bg-yellow-500 text-stone-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-stone-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* My Templates Toggle */}
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showMyTemplates}
              onChange={(e) => setShowMyTemplates(e.target.checked)}
              className="w-4 h-4 text-yellow-500 border-stone-300 rounded focus:ring-yellow-500"
            />
            <span className="text-stone-700">My Templates</span>
          </label>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredTemplates.map((template, index) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-stone-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
            >
              {/* Image */}
              <div className="aspect-square bg-stone-100 relative overflow-hidden">
                <img
                  src={template.result_image_url || template.model_image_url}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => useTemplate(template)}
                      className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors"
                    >
                      <Download className="w-4 h-4 text-stone-700" />
                    </button>
                    <button className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors">
                      <Eye className="w-4 h-4 text-stone-700" />
                    </button>
                    {template.created_by === profile?.id && (
                      <>
                        <button
                          onClick={() => togglePublic(template)}
                          className="p-2 bg-white rounded-lg shadow-lg hover:bg-stone-50 transition-colors"
                        >
                          <Edit className="w-4 h-4 text-stone-700" />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-2 bg-white rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex space-x-1">
                  {!template.is_public && template.created_by === profile?.id && (
                    <span className="bg-stone-800 text-white px-2 py-1 text-xs rounded-full">
                      Private
                    </span>
                  )}
                  {template.usage_count > 10 && (
                    <span className="bg-yellow-400 text-stone-800 px-2 py-1 text-xs rounded-full">
                      Popular
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-stone-900 truncate">{template.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-stone-600">{template.rating.toFixed(1)}</span>
                  </div>
                </div>

                {template.description && (
                  <p className="text-stone-600 text-sm mb-3 line-clamp-2">
                    {template.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500 capitalize">
                    {template.category}
                  </span>
                  <span className="text-xs text-stone-500">
                    {template.usage_count} uses
                  </span>
                </div>

                {/* Tags */}
                {template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.tags.slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-full">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-stone-100 rounded-lg flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-medium text-stone-900 mb-2">No templates found</h3>
          <p className="text-stone-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default TemplateManager;