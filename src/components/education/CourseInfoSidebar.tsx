
import React from 'react';
import { EducationContent } from '@/services/education';
import EnrollmentSection from './EnrollmentSection';

interface CourseInfoSidebarProps {
  course: EducationContent;
}

const CourseInfoSidebar = ({ course }: CourseInfoSidebarProps) => {
  return (
    <div>
      <div className="bg-emerge-cream p-5">
        <h3 className="text-lg font-medium mb-4">Course Information</h3>
        <EnrollmentSection course={course} />
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
