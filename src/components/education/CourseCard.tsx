
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, PlayCircle, AlertTriangle } from "lucide-react";
import { Course } from "@/services/courseService";
import { Link } from "react-router-dom";

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const isComingSoon = !course.is_published;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="aspect-video relative">
        {course.image_url ? (
          <img 
            src={course.image_url} 
            alt={course.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop";
            }}
          />
        ) : (
          <div className="w-full h-full bg-emerge-cream flex items-center justify-center">
            <PlayCircle className="h-12 w-12 text-emerge-gold opacity-50" />
          </div>
        )}
      </div>

      <CardHeader className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="capitalize">
            {course.level}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {course.category.replace('_', ' ')}
          </Badge>
        </div>
        <h3 className="font-semibold text-lg">{course.title}</h3>
        {course.summary && (
          <p className="text-gray-600 text-sm line-clamp-2">{course.summary}</p>
        )}
      </CardHeader>

      <CardContent className="p-4 pt-0">
        {isComingSoon ? (
          <div className="flex items-center gap-2 text-emerge-gold">
            <AlertTriangle size={16} />
            <span className="text-sm font-medium">Coming Soon</span>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            asChild
          >
            <Link to={`/education/course/${course.id}`}>
              View Course
              {course.hosting_type === 'external' && (
                <ExternalLink className="ml-2 h-4 w-4" />
              )}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
