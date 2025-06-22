import React from 'react';
import { Shirt, WaypointsIcon as Pants, User } from 'lucide-react';

interface CategorySelectorProps {
  category: 'tops' | 'bottoms' | 'full-body';
  onChange: (category: 'tops' | 'bottoms' | 'full-body') => void;
}

const categories = [
  { id: 'auto', label: 'Auto', icon: User },
  { id: 'tops', label: 'Top', icon: Shirt },
  { id: 'bottoms', label: 'Bottom', icon: Pants },
  { id: 'full-body', label: 'Full-body', icon: User },
];

const CategorySelector: React.FC<CategorySelectorProps> = ({ category, onChange }) => {
  return (
    <div className="flex space-x-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => cat.id !== 'auto' && onChange(cat.id as 'tops' | 'bottoms' | 'full-body')}
          className={`
            flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${cat.id === 'auto' 
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
              : category === cat.id
                ? 'bg-stone-800 text-white'
                : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
            }
          `}
        >
          <cat.icon className="w-4 h-4 mr-2" />
          {cat.label}
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;