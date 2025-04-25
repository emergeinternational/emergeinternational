
import React from 'react';
import { ExternalLink, Link2Off } from "lucide-react";
import { EducationContent } from '@/services/education';
import { trackCourseProgress } from '@/services/education';

interface EnrollmentSectionProps {
  course: EducationContent;
}

const EnrollmentSection = ({ course }: EnrollmentSectionProps) => {
  const isVideoEmbed = (url?: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleEnrollClick = async () => {
    if (course) {
      await trackCourseProgress(course.id, course.category_id || '');
      if (course.source_url) {
        window.open(course.source_url, '_blank');
      }
    }
  };

  const isEmbeddedVideo = course.content_type === 'video' && isVideoEmbed(course.source_url);
  
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
          onClick={handleEnrollClick}
        >
          <ExternalLink className="mr-2 h-4 w-4" /> Visit Course
        </a>
        <p className="text-center text-xs text-gray-500 flex items-center justify-center mt-2">
          <Link2Off className="mr-2 h-3 w-3 text-emerge-gold" />
          You'll be redirected to {hostname}
        </p>
      </div>
    );
  }

  // Missing or invalid link
  return (
    <div className="p-4 border border-yellow-200 bg-yellow-50 rounded">
      <p className="text-orange-700">External course link coming soon. Check back within 24 hours.</p>
    </div>
  );
};

export default EnrollmentSection;
