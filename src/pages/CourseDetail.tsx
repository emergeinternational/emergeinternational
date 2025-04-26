
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, Award, ExternalLink, Globe } from "lucide-react";
import { getCourses, updateCourseProgress, getUserEnrollments, enrollInCourse } from "@/services/courseService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("content");
  const [currentProgress, setCurrentProgress] = useState(0);
  const [enrollmentId, setEnrollmentId] = useState<string>();
  
  // Fetch course details
  const { data: courseData, isLoading: isLoadingCourse } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const allCourses = await getCourses();
      const course = allCourses.find(c => c.id === courseId);
      if (!course) throw new Error("Course not found");
      return course;
    }
  });
  
  // Fetch user enrollment if logged in
  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ["userEnrollments"],
    queryFn: getUserEnrollments,
    enabled: !!user
  });
  
  // Find user's enrollment for this course
  useEffect(() => {
    if (enrollments && courseId) {
      const enrollment = enrollments.find(e => e.courseId === courseId);
      if (enrollment) {
        setCurrentProgress(enrollment.progressPercent);
        setEnrollmentId(enrollment.id);
      }
    }
  }, [enrollments, courseId]);
  
  // Handle course completion
  const handleProgress = async (newProgress: number) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to track your progress",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (!enrollmentId) {
        // Enroll first if not enrolled
        await enrollInCourse(courseId!);
        const newEnrollments = await getUserEnrollments();
        const newEnrollment = newEnrollments.find(e => e.courseId === courseId);
        if (newEnrollment) {
          setEnrollmentId(newEnrollment.id);
        } else {
          throw new Error("Failed to create enrollment");
        }
      }
      
      // Update progress
      await updateCourseProgress(enrollmentId!, newProgress);
      setCurrentProgress(newProgress);
      
      if (newProgress === 100) {
        toast({
          title: "Course Completed!",
          description: "Congratulations! Your certificate will be generated soon.",
        });
      } else {
        toast({
          title: "Progress Updated",
          description: `Your progress has been saved (${newProgress}%)`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const languageLabels: Record<string, string> = {
    'en': 'English',
    'am': 'Amharic',
    'es': 'Spanish'
  };
  
  if (isLoadingCourse) {
    return (
      <MainLayout>
        <div className="emerge-container py-16">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gray-800 rounded w-1/3"></div>
            <div className="h-64 bg-gray-800 rounded"></div>
            <div className="h-20 bg-gray-800 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!courseData) {
    return (
      <MainLayout>
        <div className="emerge-container py-16">
          <div className="text-center py-12">
            <h2 className="text-2xl font-medium mb-2">Course Not Found</h2>
            <p className="text-gray-500 mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/education')}>
              Back to Courses
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="emerge-container py-12">
        <Button
          variant="ghost"
          onClick={() => navigate('/education')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="emerge-heading text-3xl">{courseData.title}</h1>
              
              <div className="flex flex-wrap gap-2 my-4">
                <Badge variant="outline" className="bg-emerge-gold/20 text-emerge-gold border-emerge-gold/50">
                  {courseData.level}
                </Badge>
                
                {courseData.durationMinutes && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {Math.floor(courseData.durationMinutes / 60)}h {courseData.durationMinutes % 60}m
                  </Badge>
                )}
                
                {courseData.language && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {languageLabels[courseData.language] || courseData.language}
                  </Badge>
                )}
              </div>
              
              <p className="text-gray-400 mt-4">
                {courseData.description || courseData.overview}
              </p>
            </div>
            
            {user && enrollmentId && (
              <Card className="bg-emerge-darkBg border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">Your Progress</h3>
                    <span className="text-emerge-gold">{currentProgress}%</span>
                  </div>
                  <Progress value={currentProgress} className="h-2 mb-4" />
                  
                  <div className="flex gap-4 justify-end">
                    {currentProgress < 100 && (
                      <Button
                        onClick={() => handleProgress(Math.min(currentProgress + 25, 100))}
                        className="bg-emerge-gold hover:bg-emerge-darkGold text-black"
                      >
                        Mark Progress
                      </Button>
                    )}
                    
                    {currentProgress === 100 ? (
                      <Button
                        onClick={() => navigate('/education?tab=certificates')}
                        className="gap-2"
                      >
                        <Award className="h-4 w-4" />
                        View Certificate
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleProgress(100)}
                        variant="outline"
                      >
                        Complete Course
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 border-b w-full justify-start rounded-none bg-transparent p-0">
                  <TabsTrigger 
                    value="content"
                    className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-emerge-gold data-[state=active]:bg-transparent"
                  >
                    Course Content
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-6">
                  {courseData.source === 'external' ? (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-6">
                        This course is hosted on an external platform. Click below to access the full course content.
                      </p>
                      <Button 
                        onClick={() => window.open(courseData.externalUrl, '_blank')}
                        className="gap-2"
                      >
                        Visit Course <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : courseData.source === 'embedded' && courseData.videoUrl ? (
                    <div className="space-y-4">
                      <div className="relative aspect-video w-full">
                        <iframe 
                          src={courseData.videoUrl}
                          className="absolute inset-0 w-full h-full rounded-lg"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={courseData.title}
                        ></iframe>
                      </div>
                      
                      {!user && (
                        <div className="bg-emerge-gold/20 border border-emerge-gold/50 p-4 rounded-md">
                          <p className="text-sm">
                            Sign in to enroll in this course and track your progress towards earning a certificate.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400">
                        Course content is being prepared. Please check back soon.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
          
          <div>
            <div className="bg-emerge-darkBg border border-gray-800 rounded-lg overflow-hidden sticky top-24">
              <div className="aspect-video overflow-hidden">
                <img
                  src={courseData.thumbnailUrl || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d'}
                  alt={courseData.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6 space-y-6">
                {!user ? (
                  <Button className="w-full" onClick={() => navigate('/login')}>
                    Sign In to Enroll
                  </Button>
                ) : enrollmentId ? (
                  <Button
                    className="w-full"
                    disabled={currentProgress === 100}
                    onClick={() => handleProgress(Math.min(currentProgress + 25, 100))}
                  >
                    {currentProgress === 100 ? 'Completed' : 'Continue Learning'}
                  </Button>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handleProgress(0)}
                  >
                    Start Learning
                  </Button>
                )}
                
                <div className="text-sm text-gray-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="text-white capitalize">{courseData.level}</span>
                  </div>
                  
                  {courseData.durationMinutes && (
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="text-white">
                        {Math.floor(courseData.durationMinutes / 60)}h {courseData.durationMinutes % 60}m
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span className="text-white">{languageLabels[courseData.language] || courseData.language}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span>Certificate:</span>
                    <span className="text-emerge-gold">Upon completion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
