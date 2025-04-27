import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader, Plus, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
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

      return data.map(course => ({
        ...course,
        description: course.summary || '',
        status: course.is_published ? 'published' : 'draft',
        price: 0,
        enrollments_count: course.enrollments?.[0]?.count || 0
      })) as PremiumCourse[];
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

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-emerge-gold" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center text-red-500 p-4">
          Error loading premium courses. Please try again.
        </div>
      </AdminLayout>
    );
  }

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
            {courses && courses.length > 0 ? (
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
                              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                onClick={() => confirmDelete(course)}
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
            ) : (
              <div className="text-center py-8 text-gray-500">
                No premium courses found. Add your first course to get started.
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete <strong>{courseToDelete?.title}</strong>?</p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone. All associated enrollments and content will be permanently removed.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PremiumCoursesPage;
