
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Calendar, Book } from "lucide-react";
import { SimpleCourse } from '@/services/education/simpleCourseService';

interface CourseOverviewProps {
  course: SimpleCourse;
}

const CourseOverview = ({ course }: CourseOverviewProps) => {
  const getNextStartDate = () => {
    const now = new Date();
    const daysToAdd = Math.floor(Math.random() * 14) + 1;
    now.setDate(now.getDate() + daysToAdd);
    return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const isVideoEmbed = (url?: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  return (
    <div className="mb-8">
      <h1 className="emerge-heading text-3xl mb-4">{course.title}</h1>
      {course.talent_type && (
        <Badge className="bg-emerge-gold text-white mb-4">
          {course.talent_type.charAt(0).toUpperCase() + course.talent_type.slice(1)}
        </Badge>
      )}
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
        {!isVideoEmbed(course.source_url) && (
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-emerge-gold" />
            <span>Next Start: {getNextStartDate()}</span>
          </div>
        )}
        <div className="flex items-center">
          <Book className="mr-2 h-4 w-4 text-emerge-gold" />
          <span>Level: {course.level || 'Beginner'}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseOverview;
