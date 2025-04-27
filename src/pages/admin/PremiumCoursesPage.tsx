
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/layouts/AdminLayout";
import PremiumCourseUploadForm from "@/components/admin/PremiumCourseUploadForm";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PremiumCourse } from "@/services/premiumCourseService";

const PremiumCoursesPage = () => {
  const { hasRole } = useAuth();
  const [courses, setCourses] = useState<PremiumCourse[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('premium_courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      return;
    }

    setCourses(data || []);
  };

  const togglePublishStatus = async (courseId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('premium_courses')
      .update({ is_published: !currentStatus })
      .eq('id', courseId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update course status",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: `Course ${!currentStatus ? 'published' : 'unpublished'} successfully`
    });

    // Refresh courses list
    fetchCourses();
  };

  if (!hasRole(['admin', 'editor'])) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Premium Courses Management</h1>
        
        {/* Course Upload Form */}
        <div className="mb-8">
          <PremiumCourseUploadForm />
        </div>

        {/* Courses List with Publish Toggle */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Manage Courses</h2>
          <div className="grid gap-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-gray-500">
                    {course.is_published ? 'Published' : 'Draft'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Switch
                    checked={course.is_published}
                    onCheckedChange={() => togglePublishStatus(course.id, course.is_published)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default PremiumCoursesPage;
