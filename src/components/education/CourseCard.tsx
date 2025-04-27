import { Link } from "react-router-dom";
import { ChevronRight, AlertTriangle } from "lucide-react";

interface CourseCardProps {
  id: string | number;
  name: string;
  level: string;
  description: string;
  image: string;
  duration?: string;
  levelName: string;
  sourceUrl?: string;
  isUrlValid?: boolean;
}

const CourseCard = ({ 
  id, 
  name, 
  level, 
  description, 
  image, 
  duration, 
  levelName,
  sourceUrl,
  isUrlValid 
}: CourseCardProps) => {
  
  // Check if image URL is valid, if not, use a placeholder
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&auto=format&fit=crop";
  };
  
  return (
    <Link 
      to={`/education/course/${id}`} 
      className="bg-white group shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
    >
      <div className="aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={handleImageError}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 uppercase">
            {levelName}
          </span>
          <span className="text-xs text-emerge-gold">Free</span>
        </div>
        <h3 className="font-medium text-lg mb-2">{name}</h3>
        <p className="text-gray-600 text-sm flex-grow">
          {description}
        </p>
        
        {isUrlValid === false && (
          <div className="mt-2 mb-3 py-2 px-3 bg-emerge-gold/10 text-sm flex items-center rounded">
            <AlertTriangle size={14} className="text-emerge-gold mr-2 flex-shrink-0" />
            <span className="text-gray-700">Course Coming Soon</span>
          </div>
        )}
        
        <div className="mt-4">
          <span className="text-emerge-gold group-hover:underline flex items-center">
            Learn More <ChevronRight size={16} className="ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
