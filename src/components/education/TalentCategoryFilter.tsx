
import { useState } from 'react';
import { TALENT_TYPES } from '@/services/educationService';

interface TalentCategoryFilterProps {
  activeCategory: string;
  onChange: (category: string) => void;
}

const TalentCategoryFilter = ({ 
  activeCategory, 
  onChange 
}: TalentCategoryFilterProps) => {
  const talentLabels: Record<string, string> = {
    all: 'All Categories',
    models: 'Models',
    designers: 'Designers',
    photographers: 'Photographers',
    videographers: 'Videographers',
    influencers: 'Social Media Influencers',
    entertainment: 'Entertainment Talent'
  };

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium mb-3">Browse by Talent Category</h2>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onChange('all')}
          className={`px-4 py-2 rounded-full ${
            activeCategory === 'all'
              ? "bg-emerge-gold text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {talentLabels.all}
        </button>
        {TALENT_TYPES.map(type => (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={`px-4 py-2 rounded-full ${
              activeCategory === type
                ? "bg-emerge-gold text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {talentLabels[type] || type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TalentCategoryFilter;
