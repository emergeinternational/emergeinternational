
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { listPublishedPremiumCourses, enrollInPremiumCourse, isUserEnrolled, PremiumCourse } from "@/services/premiumCourseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Added Badge import

const PremiumCoursesListPage = () => {
  const [courses, setCourses] = useState<PremiumCourse[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const fetchedCourses = await listPublishedPremiumCourses();
    
    // Filter out expired courses
    const activeCourses = fetchedCourses.filter(course => {
      if (!course.end_date) return true;
      return new Date(course.end_date) > new Date();
    });
    
    setCourses(activeCourses);
    
    if (user) {
      const enrollmentStatus: Record<string, boolean> = {};
      for (const course of activeCourses) {
        enrollmentStatus[course.id] = await isUserEnrolled(course.id);
      }
      setEnrolledCourses(enrollmentStatus);
    }
    
    setLoading(false);
  };

  const isEnrollmentOpen = (course: PremiumCourse) => {
    if (!course.start_date && !course.end_date) return true;
    
    const now = new Date();
    const start = course.start_date ? new Date(course.start_date) : null;
    const end = course.end_date ? new Date(course.end_date) : null;
    
    if (start && end) {
      return now >= start && now <= end;
    }
    
    return true;
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to enroll in courses",
        variant: "destructive"
      });
      return;
    }

    const success = await enrollInPremiumCourse(courseId);
    if (success) {
      setEnrolledCourses(prev => ({ ...prev, [courseId]: true }));
      toast({
        title: "Success",
        description: "You have been enrolled in the course"
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to enroll in the course",
        variant: "destructive"
      });
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <div className="container mx-auto py-6">Loading courses...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Premium Courses</h1>
      {courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active premium courses available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id}>
              {course.image_path && (
                <div className="relative aspect-video">
                  <img
                    src={course.image_path}
                    alt={course.title}
                    className="object-cover w-full h-full rounded-t-lg"
                  />
                  {course.end_date && getDaysRemaining(course.end_date) <= 7 && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="outline" className="bg-amber-100 text-amber-800 border border-amber-300">
                        Ending soon
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              <CardHeader>
                <CardTitle>{course.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.summary && <p className="text-sm text-gray-600">{course.summary}</p>}
                  <div className="text-sm">
                    <p><strong>Level:</strong> {course.level}</p>
                    <p><strong>Type:</strong> {course.hosting_type}</p>
                    {course.start_date && (
                      <p><strong>Start Date:</strong> {new Date(course.start_date).toLocaleDateString()}</p>
                    )}
                    {course.end_date && (
                      <p><strong>End Date:</strong> {new Date(course.end_date).toLocaleDateString()}</p>
                    )}
                    {course.end_date && getDaysRemaining(course.end_date) <= 7 && (
                      <p className="text-amber-600 font-medium">
                        {getDaysRemaining(course.end_date)} days remaining
                      </p>
                    )}
                  </div>
                  {isEnrollmentOpen(course) && !enrolledCourses[course.id] && (
                    <Button
                      onClick={() => handleEnroll(course.id)}
                      className="w-full mt-4"
                    >
                      Enroll Now
                    </Button>
                  )}
                  {enrolledCourses[course.id] && (
                    <Button disabled className="w-full mt-4">
                      Enrolled
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PremiumCoursesListPage;
