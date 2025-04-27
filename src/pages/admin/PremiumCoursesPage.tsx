
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CourseList from '@/components/premium-courses/CourseList';
import DeleteCourseDialog from '@/components/premium-courses/DeleteCourseDialog';

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

const PremiumCoursesPage = () => {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const canEdit = hasRole(['admin', 'editor']);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<PremiumCourse | null>(null);

  const { data: courses, isLoading, error, refetch } = useQuery({
    queryKey: ['premium-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('premium_courses')
        .select(`
          *,
          enrollments:premium_enrollments(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(course => {
        // Safely handle the enrollments count
        let enrollmentsCount = 0;
        if (course.enrollments && 
            Array.isArray(course.enrollments) && 
            course.enrollments.length > 0 && 
            course.enrollments[0] && 
            typeof course.enrollments[0].count === 'number') {
          enrollmentsCount = course.enrollments[0].count;
        }
        
        return {
          ...course,
          description: course.summary || '',
          status: course.is_published ? 'published' : 'draft',
          price: 0, // Placeholder value
          enrollments_count: enrollmentsCount
        };
      }) as PremiumCourse[];
    }
  });

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const { error } = await supabase
        .from('premium_courses')
        .delete()
        .eq('id', courseToDelete.id);

      if (error) throw error;

      toast({
        title: "Course deleted",
        description: `${courseToDelete.title} has been deleted successfully.`
      });

      refetch();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  const confirmDelete = (course: PremiumCourse) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleEditCourse = (course: PremiumCourse) => {
    // This would be implemented in a future feature
    toast({
      title: "Edit Course",
      description: "Course editing will be implemented in a future update."
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Premium Courses</h1>
          {canEdit && (
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Course
            </Button>
          )}
        </div>

        <div className="bg-white rounded-md shadow">
          <div className="p-4 border-b">
            <h2 className="font-medium">All Premium Courses</h2>
          </div>
          <div className="p-4">
            <CourseList
              courses={courses}
              isLoading={isLoading}
              error={error as Error}
              onEditCourse={handleEditCourse}
              onDeleteCourse={confirmDelete}
            />
          </div>
        </div>
      </div>

      <DeleteCourseDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        course={courseToDelete}
        onDelete={handleDeleteCourse}
      />
    </AdminLayout>
  );
};

export default PremiumCoursesPage;
