
import React from 'react';
import { SimpleCourse } from '@/services/education/simpleCourseService';
import { ExternalLink, Link2Off } from "lucide-react";

interface CourseInfoSidebarProps {
  course: SimpleCourse;
}

const CourseInfoSidebar = ({ course }: CourseInfoSidebarProps) => {
  const isVideoEmbed = (url?: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const isValidUrl = (url?: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isEmbeddedVideo = course.content_type === 'video' && isVideoEmbed(course.source_url);
  
  const renderEnrollmentSection = () => {
    if (isEmbeddedVideo) {
      return (
        <div className="space-y-2">
          <p className="text-gray-700">
            This video lesson is available directly on this page. Click play to begin learning.
          </p>
        </div>
      );
    }

    if (course.source_url && isValidUrl(course.source_url)) {
      try {
        const hostname = new URL(course.source_url).hostname;
        const platform = hostname.replace('www.', '').split('.')[0];
        const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

        return (
          <div className="space-y-2">
            <p className="text-gray-700 mb-2">
              Click the course link below to access this course on {platformName}.
            </p>
            <a 
              href={course.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-emerge-gold hover:bg-emerge-gold/90 text-white px-4 py-2 rounded inline-flex items-center justify-center"
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Visit Course
            </a>
            <p className="text-center text-xs text-gray-500 flex items-center justify-center mt-2">
              <Link2Off className="mr-2 h-3 w-3 text-emerge-gold" />
              You'll be redirected to {hostname}
            </p>
          </div>
        );
      } catch (error) {
        // In case URL parsing fails
        return (
          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded">
            <p className="text-orange-700">External course link coming soon. Check back within 24 hours.</p>
          </div>
        );
      }
    }

    // Missing or invalid link
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded">
        <p className="text-orange-700">External course link coming soon. Check back within 24 hours.</p>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-emerge-cream p-5">
        <h3 className="text-lg font-medium mb-4">Course Information</h3>
        {renderEnrollmentSection()}
      </div>
      
      {/* Similar Courses */}
      <div className="mt-6 bg-white border border-gray-200 p-5">
        <h3 className="text-lg font-medium mb-3">Similar Courses</h3>
        <ul className="space-y-3 text-sm">
          {course.talent_type && (
            <li>
              <a 
                href={`/education?talent=${course.talent_type}`} 
                className="text-emerge-gold hover:underline"
              >
                More {course.talent_type.charAt(0).toUpperCase() + course.talent_type.slice(1)} Courses
              </a>
            </li>
          )}
          <li>
            <a href="/education" className="text-emerge-gold hover:underline">
              View More {course.level || 'Beginner'} Courses
            </a>
          </li>
          <li>
            <a href="/education" className="text-emerge-gold hover:underline">
              Browse All Categories
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CourseInfoSidebar;
