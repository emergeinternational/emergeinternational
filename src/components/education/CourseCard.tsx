
import { Link } from "react-router-dom";
import { ChevronRight, Clock, Play, Video } from "lucide-react";
import { useState } from "react";
import { Course } from "@/services/courseService";

interface CourseCardProps {
  id: string | number;
  name: string;
  level: string;
  description: string;
  image: string;
  duration?: string;
  levelName: string;
  isPlaceholder?: boolean;
  videoUrl?: string;
}

const CourseCard = ({ 
  id, 
  name, 
  level, 
  description, 
  image, 
  duration, 
  levelName, 
  isPlaceholder = false,
  videoUrl 
}: CourseCardProps) => {
  const [showVideo, setShowVideo] = useState(false);
  
  // Ensure we always have valid values for rendering
  const courseName = name || "New Course Coming Soon";
  const courseDesc = description || "We're preparing new educational content in this category. Check back soon for updates.";
  const courseImage = image || "/images/placeholder-course.jpg";
  const courseDuration = duration || "Coming soon";
  const courseLevelName = levelName || level.toUpperCase();
  const courseVideoUrl = videoUrl || "";
  
  const toggleVideo = (e: React.MouseEvent) => {
    if (isPlaceholder || !courseVideoUrl) return;
    e.preventDefault();
    setShowVideo(!showVideo);
  };
  
  // Placeholder content rendering
  if (isPlaceholder) {
    return (
      <div className="bg-white group shadow-sm flex flex-col">
        <div className="aspect-video overflow-hidden bg-emerge-cream relative">
          <img 
            src={courseImage}
            alt="Placeholder course" 
            className="w-full h-full object-cover opacity-40"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "/images/placeholder-course.jpg";
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full bg-emerge-gold/50 p-3">
              <Video className="text-white" size={24} />
            </div>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-gray-500 uppercase">
              {courseLevelName}
            </span>
            <span className="text-xs text-emerge-gold flex items-center">
              <Clock size={12} className="mr-1" /> Coming soon
            </span>
          </div>
          <h3 className="font-medium text-lg mb-2 line-clamp-2">{courseName}</h3>
          <p className="text-gray-600 text-sm flex-grow line-clamp-3">
            {courseDesc}
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
      <div className="aspect-video overflow-hidden relative">
        {showVideo && courseVideoUrl ? (
          <iframe 
            src={courseVideoUrl}
            title={courseName}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <>
            <img 
              src={courseImage}
              alt={courseName} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "/images/placeholder-course.jpg";
              }}
            />
            {courseVideoUrl && (
              <button 
                onClick={toggleVideo}
                className="absolute inset-0 flex items-center justify-center group-hover:bg-black/20 transition-colors"
              >
                <div className="bg-emerge-gold rounded-full p-3 transform transition-transform group-hover:scale-110">
                  <Play className="text-white" size={20} />
                </div>
              </button>
            )}
          </>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 uppercase">
            {courseLevelName}
          </span>
          {courseDuration && (
            <span className="text-xs text-emerge-gold">{courseDuration}</span>
          )}
        </div>
        <h3 className="font-medium text-lg mb-2 line-clamp-2">{courseName}</h3>
        <p className="text-gray-600 text-sm flex-grow line-clamp-3">
          {courseDesc}
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
