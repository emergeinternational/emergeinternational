
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PremiumCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
  enrollments_count: number;
  category: "model" | "designer" | "photographer" | "videographer" | "musical_artist" | "fine_artist" | "event_planner";
  created_by?: string;
}

interface CourseListProps {
  courses: PremiumCourse[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onEditCourse: (course: PremiumCourse) => void;
  onDeleteCourse: (course: PremiumCourse) => void;
}

const CourseList: React.FC<CourseListProps> = ({
  courses,
  isLoading,
  error,
  onEditCourse,
  onDeleteCourse
}) => {
  const { hasRole } = useAuth();
  const canEdit = hasRole(['admin', 'editor']);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerge-gold border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading premium courses. Please try again.
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No premium courses found. Add your first course to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b">
            <th className="pb-2 font-medium">Title</th>
            <th className="pb-2 font-medium">Price</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Enrollments</th>
            <th className="pb-2 font-medium">Created</th>
            {canEdit && <th className="pb-2 font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id} className="border-b last:border-0">
              <td className="py-3 pr-4">{course.title}</td>
              <td className="py-3 pr-4">${course.price.toFixed(2)}</td>
              <td className="py-3 pr-4">
                {course.status === 'published' ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                    Published
                  </Badge>
                ) : (
                  <Badge variant="secondary">Draft</Badge>
                )}
              </td>
              <td className="py-3 pr-4">{course.enrollments_count}</td>
              <td className="py-3 pr-4">
                {new Date(course.created_at).toLocaleDateString()}
              </td>
              {canEdit && (
                <td className="py-3">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onEditCourse(course)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() => onDeleteCourse(course)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseList;
