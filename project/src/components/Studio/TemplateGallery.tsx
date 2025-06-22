import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Play } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'full-body';
  modelImage: string;
  garmentImage: string;
  resultImage: string;
  tags: string[];
}

const templates: Template[] = [
  {
    id: '1',
    name: 'Casual Summer Look',
    category: 'tops',
    modelImage: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
    garmentImage: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg',
    resultImage: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
    tags: ['casual', 'summer', 'trendy'],
  },
  {
    id: '2',
    name: 'Business Professional',
    category: 'full-body',
    modelImage: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
    garmentImage: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg',
    resultImage: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
    tags: ['business', 'professional', 'formal'],
  },
  {
    id: '3',
    name: 'Street Style',
    category: 'bottoms',
    modelImage: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
    garmentImage: 'https://images.pexels.com/photos/1040424/pexels-photo-1040424.jpeg',
    resultImage: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg',
    tags: ['street', 'urban', 'edgy'],
  },
];

interface TemplateGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
}

const TemplateGallery: React.FC<TemplateGalleryProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Template Gallery</h2>
            <p className="text-stone-600 text-sm">Choose a template to get started quickly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Category Filter */}
          <div className="flex space-x-2 mb-6">
            {['all', 'tops', 'bottoms', 'full-body'].map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedCategory === category
                    ? 'bg-yellow-400 text-stone-800'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                className="bg-stone-50 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all"
                onClick={() => {
                  onSelectTemplate(template);
                  onClose();
                }}
              >
                <div className="aspect-square bg-white rounded-lg mb-3 overflow-hidden relative group">
                  <img
                    src={template.resultImage}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="bg-white rounded-full p-3">
                      <Play className="w-5 h-5 text-stone-700" />
                    </div>
                  </div>
                </div>
                
                <h3 className="font-medium text-stone-900 mb-2">{template.name}</h3>
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-stone-200 text-stone-600 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TemplateGallery;