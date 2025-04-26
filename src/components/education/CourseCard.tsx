
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Course } from "@/types/education";
import { ExternalLink, Play, Globe } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
  userProgress?: number;
}

export function CourseCard({ course, onEnroll, userProgress }: CourseCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  
  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);
  
  const languageLabels: Record<string, string> = {
    'en': 'English',
    'am': 'Amharic',
    'es': 'Spanish'
  };
  
  return (
    <Card 
      className="overflow-hidden bg-white/5 border-gray-800 hover:border-emerge-gold transition-all h-full flex flex-col"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative aspect-video">
        <img
          src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop'}
          alt={course.title}
          className="object-cover w-full h-full"
        />
        {course.source === 'embedded' && (
          <div 
            className={`absolute inset-0 bg-black/60 flex items-center justify-center ${isHovering ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          >
            <Play className="w-16 h-16 text-emerge-gold" />
          </div>
        )}
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs uppercase tracking-wider bg-emerge-gold/20 text-emerge-gold border-emerge-gold/50">
            {course.level}
          </Badge>
          {course.durationMinutes && (
            <span className="text-xs text-gray-400">
              {Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-white">{course.title}</h3>
        {course.language && (
          <div className="flex items-center text-xs text-gray-400 gap-1">
            <Globe className="h-3 w-3" />
            <span>{languageLabels[course.language] || course.language}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-gray-400 line-clamp-2">{course.overview}</p>
        
        {userProgress !== undefined && (
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Progress</span>
              <span>{userProgress}%</span>
            </div>
            <Progress value={userProgress} className="h-1" />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {course.source === 'external' ? (
          <Button
            className="w-full"
            onClick={() => window.open(course.externalUrl, '_blank')}
          >
            Visit Course <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => onEnroll(course.id)}
          >
            {userProgress !== undefined && userProgress > 0 ? 'Continue Learning' : 'Start Learning'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
