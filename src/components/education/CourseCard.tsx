
import { Link } from "react-router-dom";
import { ChevronRight, Clock } from "lucide-react";

interface CourseCardProps {
  id: string | number;
  name: string;
  level: string;
  description: string;
  image: string;
  duration?: string;
  levelName: string;
  isPlaceholder?: boolean;
}

const CourseCard = ({ id, name, level, description, image, duration, levelName, isPlaceholder = false }: CourseCardProps) => {
  // Placeholder content rendering
  if (isPlaceholder) {
    return (
      <div className="bg-white group shadow-sm flex flex-col">
        <div className="aspect-video overflow-hidden bg-emerge-cream">
          <img 
            src={image} 
            alt="Placeholder course" 
            className="w-full h-full object-cover opacity-40"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800&auto=format&fit=crop";
            }}
          />
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 uppercase">
              {levelName}
            </span>
            <span className="text-xs text-emerge-gold flex items-center">
              <Clock size={12} className="mr-1" /> Coming soon
            </span>
          </div>
          <h3 className="font-medium text-lg mb-2 line-clamp-2">{name || "New Course Coming Soon"}</h3>
          <p className="text-gray-600 text-sm flex-grow line-clamp-3">
            {description || "We're preparing new educational content in this category. Check back soon for updates."}
          </p>
          <div className="mt-4">
            <span className="text-gray-400 flex items-center">
              Course under development
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Regular course rendering
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
          onError={(e) => {
            // Fallback image if the original fails to load
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevents infinite loop
            target.src = "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800&auto=format&fit=crop";
          }}
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 uppercase">
            {levelName}
          </span>
          {duration && (
            <span className="text-xs text-emerge-gold">{duration}</span>
          )}
        </div>
        <h3 className="font-medium text-lg mb-2 line-clamp-2">{name}</h3>
        <p className="text-gray-600 text-sm flex-grow line-clamp-3">
          {description}
        </p>
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
