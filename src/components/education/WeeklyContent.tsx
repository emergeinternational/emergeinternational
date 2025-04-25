
import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { WeeklyContentItem } from '@/services/education/simpleCourseService';

interface WeeklyContentProps {
  weeklyContent: WeeklyContentItem[];
}

const WeeklyContent: React.FC<WeeklyContentProps> = ({ weeklyContent }) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(0);

  const toggleWeek = (index: number) => {
    setExpandedWeek(expandedWeek === index ? null : index);
  };

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-xl font-medium mb-3">Weekly Content</h2>
      {weeklyContent.map((week, index) => (
        <div key={index} className="border border-gray-200 rounded-md overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-gray-50"
            onClick={() => toggleWeek(index)}
          >
            <h3 className="font-medium">{week.title}</h3>
            {expandedWeek === index ? (
              <ChevronUp className="h-5 w-5 text-emerge-gold" />
            ) : (
              <ChevronDown className="h-5 w-5 text-emerge-gold" />
            )}
          </button>
          {expandedWeek === index && (
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-gray-700">{week.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WeeklyContent;
