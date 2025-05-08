
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getUserEnrolledCourses, PremiumCourseEnrollment } from "@/services/premiumCourseService";

const MyPremiumCourses = () => {
  const [enrollments, setEnrollments] = useState<PremiumCourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchEnrollments = async () => {
      const data = await getUserEnrolledCourses();
      // Only show enrollments for published courses
      setEnrollments(data.filter(enrollment => enrollment.course?.is_published));
      setLoading(false);
    };

    fetchEnrollments();
  }, [user, navigate]);

  const filterCourses = (courses: PremiumCourseEnrollment[], tab: string) => {
    const today = new Date();
    return courses.filter(enrollment => {
      const endDate = enrollment.course?.end_date ? new Date(enrollment.course.end_date) : null;
      
      if (tab === "active") {
        return !endDate || endDate >= today;
      } else {
        return endDate && endDate < today;
      }
    }).sort((a, b) => {
      // Sort by start date if available, otherwise by enrollment date
      const dateA = a.course?.start_date ? new Date(a.course.start_date) : new Date(a.created_at);
      const dateB = b.course?.start_date ? new Date(b.course.start_date) : new Date(b.created_at);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const isCourseExpired = (endDate?: string) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6">
          <div className="text-center">Loading your courses...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">My Premium Courses</h1>

        <Tabs defaultValue="active" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Courses</TabsTrigger>
            <TabsTrigger value="expired">Expired Courses</TabsTrigger>
          </TabsList>

          {["active", "expired"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {filterCourses(enrollments, tab).length === 0 ? (
                <div className="text-center text-gray-600">
                  <p>No {tab} courses found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filterCourses(enrollments, tab).map((enrollment) => (
                    <Card key={enrollment.id} className="overflow-hidden">
                      {enrollment.course?.image_path && (
                        <div className="relative aspect-video">
                          <img
                            src={enrollment.course.image_path}
                            alt={enrollment.course.title}
                            className="object-cover w-full h-full"
                          />
                          {isCourseExpired(enrollment.course.end_date) && (
                            <div className="absolute top-2 right-2">
                              <Badge variant="secondary" className="bg-gray-200 text-gray-600">
                                Course Ended
                              </Badge>
                            </div>
                          )}
                        </div>
                      )}
                      <CardHeader>
                        <CardTitle>{enrollment.course?.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {enrollment.course?.summary && (
                            <p className="text-sm text-gray-600">{enrollment.course.summary}</p>
                          )}
                          <div className="text-sm space-y-1">
                            <p>
                              <strong>Type:</strong> {enrollment.course?.hosting_type}
                            </p>
                            <p className="flex items-center text-gray-600">
                              <Clock size={14} className="mr-1" />
                              Enrolled on {format(new Date(enrollment.created_at), 'MMM d, yyyy')}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default MyPremiumCourses;
