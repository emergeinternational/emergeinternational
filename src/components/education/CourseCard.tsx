
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { trackCourseEngagement } from "@/services/educationService";

interface CourseCardProps {
  id: number | string;
  name: string;
  level: string;
  description: string;
  image: string;
  duration?: string;
  levelName: string;
}

const CourseCard = ({ id, name, level, description, image, duration, levelName }: CourseCardProps) => {
  const courseId = id.toString();
  
  const handleClick = async () => {
    try {
      await trackCourseEngagement(courseId);
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  };
  
  return (
    <Link 
      to={`/education/course/${courseId}`} 
      className="bg-white group shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
      onClick={handleClick}
    >
      <div className="aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
        <h3 className="font-medium text-lg mb-2">{name}</h3>
        <p className="text-gray-600 text-sm flex-grow">
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
