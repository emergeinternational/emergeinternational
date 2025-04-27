
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import AdminLayout from "@/layouts/AdminLayout";
import PremiumCourseUploadForm from "@/components/admin/PremiumCourseUploadForm";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PremiumCourse, triggerExpirationNotifications } from "@/services/premiumCourseService";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const PremiumCoursesPage = () => {
  const { hasRole } = useAuth();
  const [courses, setCourses] = useState<PremiumCourse[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [processingNotification, setProcessingNotification] = useState<string | null>(null);
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

    fetchCourses();
  };

  const isCourseExpired = (course: PremiumCourse) => {
    if (!course.end_date) return false;
    return new Date(course.end_date) < new Date();
  };

  const getDaysUntilExpiration = (course: PremiumCourse) => {
    if (!course.end_date) return null;
    const endDate = new Date(course.end_date);
    const today = new Date();
    const differenceInTime = endDate.getTime() - today.getTime();
    return Math.ceil(differenceInTime / (1000 * 3600 * 24));
  };

  const handleTestNotifications = async (courseId: string) => {
    setProcessingNotification(courseId);
    
    try {
      const result = await triggerExpirationNotifications(courseId);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Notification test triggered successfully. Check logs for details.",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to trigger notifications",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setProcessingNotification(null);
    }
  };

  const filterCourses = (courses: PremiumCourse[], tab: string) => {
    return courses.filter(course => {
      const isExpired = isCourseExpired(course);
      if (tab === "expired") return isExpired;
      return !isExpired;
    });
  };

  if (!hasRole(['admin', 'editor'])) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Premium Courses Management</h1>
        
        <div className="mb-8">
          <PremiumCourseUploadForm />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active">Active Courses</TabsTrigger>
            <TabsTrigger value="expired">Expired Courses</TabsTrigger>
          </TabsList>

          {["active", "expired"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  {tab === "active" ? "Active" : "Expired"} Courses
                </h2>
                <div className="grid gap-4">
                  {filterCourses(courses, tab).map((course) => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{course.title}</h3>
                          {course.end_date && (
                            <Badge variant={isCourseExpired(course) ? "secondary" : "outline"} className="ml-2">
                              {isCourseExpired(course) 
                                ? "Expired" 
                                : `${getDaysUntilExpiration(course)} days remaining`}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {course.is_published ? 'Published' : 'Draft'} • 
                          {course.end_date 
                            ? ` Ends on ${new Date(course.end_date).toLocaleDateString()}` 
                            : ' No end date'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestNotifications(course.id)}
                          disabled={processingNotification === course.id || !course.end_date}
                          title={!course.end_date ? "Course needs an end date to test notifications" : "Test expiration notifications"}
                        >
                          <Bell className="w-4 h-4 mr-1" />
                          {processingNotification === course.id ? "Sending..." : "Test Notifications"}
                        </Button>
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
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default PremiumCoursesPage;
