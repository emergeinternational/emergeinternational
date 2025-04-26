
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { ArrowLeft, Calendar, MapPin, Clock, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { getCourseById, trackCourseEngagement, CourseProgress } from "../services/courseService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<number>(0);
  const [urlExists, setUrlExists] = useState<boolean | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      try {
        setIsLoading(true);
        const courseData = await getCourseById(courseId);

        if (courseData) {
          setCourse(courseData);
          
          // Track engagement when course is viewed
          if (isAuthenticated && user?.id) {
            await trackCourseEngagement(courseData.id);
          }

          // Check if URL exists if source_url is provided
          if (courseData.source_url && courseData.source_url !== "#") {
            try {
              // Simple check to see if URL is well-formed
              new URL(courseData.source_url);
              
              // Check if URL isn't pointing to known placeholder domains
              const lowercaseUrl = courseData.source_url.toLowerCase();
              if (
                !lowercaseUrl.includes('example.com') && 
                !lowercaseUrl.includes('placeholder') &&
                !lowercaseUrl.includes('localhost')
              ) {
                setUrlExists(true);
              } else {
                setUrlExists(false);
              }
            } catch (e) {
              setUrlExists(false);
            }
          } else {
            setUrlExists(false);
          }
        } else {
          toast({
            title: "Course Not Found",
            description: "We couldn't find the course you're looking for.",
            variant: "destructive",
          });
        }

      } catch (error) {
        console.error("Error fetching course details:", error);
        toast({
          title: "Error",
          description: "Failed to load course details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId, toast, isAuthenticated, user]);

  const handleExternalLinkClick = async () => {
    if (!course || !course.source_url) return;
    
    // Track clicks to external course URLs
    try {
      if (isAuthenticated && user?.id) {
        await trackCourseEngagement(course.id);
      }
      
      // Open in new tab
      window.open(course.source_url, '_blank');
    } catch (error) {
      console.error("Error tracking course engagement:", error);
    }
  };

  const getLevelName = (level: string) => {
    const levels: {[key: string]: string} = {
      "beginner": "BEGINNER",
      "intermediate": "INTERMEDIATE",
      "advanced": "ADVANCED",
      "workshop": "WORKSHOP"
    };
    
    return levels[level] || level.toUpperCase();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="emerge-container py-16">
          <div className="text-center">
            <div className="animate-pulse text-emerge-gold">Loading course details...</div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="emerge-container py-16">
          <div className="text-center">
            <h2 className="text-2xl mb-4">Course Not Found</h2>
            <p className="mb-8">We couldn't find the course you're looking for.</p>
            <Link to="/education" className="text-emerge-gold hover:underline">
              Return to Education Page
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-emerge-darkBg text-white py-12">
        <div className="emerge-container">
          <Link 
            to="/education" 
            className="inline-flex items-center text-emerge-gold mb-6 hover:underline"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Education
          </Link>
          <div className="max-w-4xl">
            <div className="flex items-center mb-3">
              <Badge className="bg-emerge-gold text-white border-0">
                {getLevelName(course.category_id)}
              </Badge>
              {course.duration && (
                <div className="flex items-center ml-3 text-sm text-gray-300">
                  <Clock size={14} className="mr-1" />
                  {course.duration}
                </div>
              )}
            </div>
            <h1 className="emerge-heading text-4xl mb-4">{course.title}</h1>
            {course.summary && (
              <p className="text-lg mb-6 text-gray-200">
                {course.summary}
              </p>
            )}
          </div>
        </div>
      </div>
      
      <div className="emerge-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 mb-8">
              <div className="aspect-video overflow-hidden mb-6 bg-gray-100">
                {course.image_url ? (
                  <img 
                    src={course.image_url} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, replace with placeholder
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&auto=format&fit=crop";
                    }}
                  />
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&auto=format&fit=crop"
                    alt="Course placeholder" 
                    className="w-full h-full object-cover" 
                  />
                )}
              </div>
              
              {urlExists === false && (
                <Alert className="mb-6 border-emerge-gold/30 bg-emerge-gold/10">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-emerge-gold mr-2" />
                    <div>
                      <p className="font-medium text-emerge-gold">Course Coming Soon</p>
                      <p className="text-gray-600">
                        This exciting course will be available shortly. Thank you for your patience.
                      </p>
                    </div>
                  </div>
                </Alert>
              )}
              
              {course.content && (
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: course.content }} />
                </div>
              )}
              
              {course.video_embed_url && (
                <div className="aspect-video mt-8">
                  <iframe 
                    src={course.video_embed_url} 
                    className="w-full h-full" 
                    title={course.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              
              {urlExists && course.source_url && course.source_url !== "#" && (
                <Button 
                  onClick={handleExternalLinkClick}
                  className="mt-8 bg-emerge-gold hover:bg-emerge-gold/90 text-white"
                >
                  Visit Course <ExternalLink size={14} className="ml-1" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Course Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 mr-3 text-emerge-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Duration</div>
                    <div className="text-gray-600">{course.duration || "Self-paced"}</div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-emerge-gold flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-gray-600">
                      {course.location || (course.content_type === "workshop" ? "In-person" : "Online")}
                    </div>
                  </div>
                </div>
                
                {course.career_interests && course.career_interests.length > 0 && (
                  <div>
                    <div className="font-medium mb-1">Relevant For</div>
                    <div className="flex flex-wrap gap-1">
                      {course.career_interests.map((interest: string, index: number) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="capitalize"
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <Button 
                  asChild
                  className="w-full"
                  variant="outline"
                >
                  <Link to="/education">
                    Browse All Courses
                  </Link>
                </Button>
              </div>
            </Card>
            
            {isAuthenticated && user && progress > 0 && (
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-medium mb-4">Your Progress</h3>
                <Progress value={progress} className="h-2 mb-2" />
                <div className="text-right text-sm text-gray-500">{progress}% complete</div>
              </Card>
            )}
            
            {/* Admin-only viewing placeholder - to be implemented in admin pages */}
            {/* Course completion functionality is now admin-controlled */}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetail;
