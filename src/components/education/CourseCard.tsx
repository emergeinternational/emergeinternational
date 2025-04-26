
import { Link } from "react-router-dom";
import { ChevronRight, Play } from "lucide-react";
import { useState } from "react";
import { Course } from "@/data/staticCourses";

interface CourseCardProps {
  course: Course;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const [showVideo, setShowVideo] = useState(false);
  
  const toggleVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowVideo(!showVideo);
  };

  return (
    <Link 
      to={`/education/course/${course.id}`} 
      className="bg-white group shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
    >
      <div className="aspect-video overflow-hidden relative">
        {showVideo ? (
          <iframe 
            src={course.video_embed_url}
            title={course.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <>
            <img 
              src={course.image_url}
              alt={course.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/images/placeholder-course.jpg";
              }}
            />
            <button 
              onClick={toggleVideo}
              className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors"
            >
              <div className="bg-emerge-gold rounded-full p-3 transform transition-transform group-hover:scale-110">
                <Play className="text-white" size={20} />
              </div>
            </button>
          </>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 uppercase">
            {course.level}
          </span>
        </div>
        <h3 className="font-medium text-lg mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-gray-600 text-sm flex-grow line-clamp-3">
          {course.summary}
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
