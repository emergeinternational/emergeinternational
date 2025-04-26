
import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink } from "lucide-react";

interface CourseCardProps {
  id: string | number;
  name: string;
  level: string;
  description: string;
  image: string;
  duration?: string;
  levelName: string;
  sourceUrl?: string;
  isHosted?: boolean;
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
  isHosted = false
}: CourseCardProps) => {
  // Determine if the course is internal or external
  const isExternalCourse = sourceUrl && !isHosted;
  
  // Component for the card content (used for both internal and external links)
  const CardContent = () => (
    <>
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
            {isExternalCourse ? (
              <>
                Visit External Course <ExternalLink size={16} className="ml-1" />
              </>
            ) : (
              <>
                Learn More <ChevronRight size={16} className="ml-1" />
              </>
            )}
          </span>
        </div>
      </div>
    </>
  );

  // Render different wrappers based on whether it's internal or external
  if (isExternalCourse) {
    return (
      <a 
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-white group shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
        aria-label={`External course: ${name}`}
      >
        <CardContent />
      </a>
    );
  }

  return (
    <Link 
      to={`/education/course/${id}`} 
      className="bg-white group shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
    >
      <CardContent />
    </Link>
  );
};

export default CourseCard;
