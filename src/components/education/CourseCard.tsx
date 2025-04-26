
import { Link } from "react-router-dom";
import { ChevronRight, ExternalLink, AlertCircle } from "lucide-react";

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
  isValidated?: boolean;
  isPlaceholder?: boolean;
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
  isHosted = false,
  isValidated = true,
  isPlaceholder = false
}: CourseCardProps) => {
  // Determine if the course is internal or external
  const isExternalCourse = sourceUrl && !isHosted;
  
  // Component for the card content (used for both internal and external links)
  const CardContent = () => (
    <>
      <div className="aspect-video overflow-hidden relative">
        <img 
          src={image} 
          alt={name} 
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isPlaceholder ? "opacity-40" : ""}`}
          onError={(e) => {
            // Fallback image if the original fails to load
            const target = e.target as HTMLImageElement;
            target.onerror = null; // Prevents infinite loop
            target.src = "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800&auto=format&fit=crop";
          }}
        />
        {isPlaceholder && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-emerge-gold/90 text-white px-3 py-1 rounded-md flex items-center">
              <AlertCircle size={16} className="mr-1" />
              <span className="text-sm font-medium">New course coming soon</span>
            </div>
          </div>
        )}
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
          {isPlaceholder 
            ? "We're preparing fresh content in this area. Check back soon for new learning opportunities!"
            : description}
        </p>
        <div className="mt-4">
          {!isPlaceholder && (
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
          )}
        </div>
      </div>
    </>
  );

  // For placeholder courses, use a non-clickable version
  if (isPlaceholder) {
    return (
      <div className="bg-white group shadow-sm transition-shadow duration-300 flex flex-col">
        <CardContent />
      </div>
    );
  }

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
