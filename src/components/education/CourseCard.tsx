
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/education";
import { ExternalLink, Play } from "lucide-react";

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
}

export function CourseCard({ course, onEnroll }: CourseCardProps) {
  return (
    <Card className="overflow-hidden bg-white/5 border-gray-800 hover:border-emerge-gold transition-all">
      <div className="relative aspect-video">
        <img
          src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop'}
          alt={course.title}
          className="object-cover w-full h-full"
        />
        {course.source !== 'external' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play className="w-12 h-12 text-white" />
          </div>
        )}
      </div>
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-emerge-gold">
            {course.level}
          </span>
          {course.durationMinutes && (
            <span className="text-xs text-gray-400">
              {Math.floor(course.durationMinutes / 60)}h {course.durationMinutes % 60}m
            </span>
          )}
        </div>
        <h3 className="text-lg font-semibold text-white">{course.title}</h3>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 line-clamp-2">{course.overview}</p>
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
            Start Learning
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
