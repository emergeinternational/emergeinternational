
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, CheckCircle, BookOpen, Clock, ArrowLeft, Award } from "lucide-react";
import { getCourseById, updateCourseProgress, CourseProgress } from "../services/courseService";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isExternalCourse, setIsExternalCourse] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        console.log("Fetching course with ID:", id);
        const courseData = await getCourseById(id);
        
        if (!courseData) {
          toast({
            title: "Course not found",
            description: "The requested course could not be found.",
            variant: "destructive",
          });
          navigate("/education");
          return;
        }
        
        setCourse(courseData);
        
        // Check if course is external based on having a source_url
        setIsExternalCourse(!!courseData.source_url);
        
        // If user is logged in, fetch their progress
        if (user) {
          try {
            // Simulate progress for now
            // In a real implementation, this would fetch from user_course_progress
            setProgress(Math.floor(Math.random() * 100));
          } catch (error) {
            console.error("Error fetching user progress:", error);
          }
        }
      } catch (error) {
        console.error("Error loading course:", error);
        toast({
          title: "Error",
          description: "Failed to load course details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user, toast, navigate]);

  const handleStartCourse = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to start this course.",
        variant: "default",
      });
      navigate("/login", { state: { returnUrl: `/education/course/${id}` } });
      return;
    }

    try {
      if (isExternalCourse && course.source_url) {
        // For external courses, open in new tab and update progress
        window.open(course.source_url, "_blank");
        await updateCourseProgress(user.id, course.id, "in_progress", course.category_id);
        
        toast({
          title: "Course Started",
          description: "We've opened the course in a new tab. Your progress will be tracked.",
        });
        
        // Set progress to at least 20% when starting
        if (progress === 0) {
          setProgress(20);
        }
      } else {
        // For embedded courses, update progress
        await updateCourseProgress(user.id, course.id, "in_progress", course.category_id);
        
        // Simulate course completion after "watching" embedded content
        if (progress === 0) {
          setProgress(20);
          toast({
            title: "Course Started",
            description: "Your progress has been saved.",
          });
        }
      }
    } catch (error) {
      console.error("Error updating course progress:", error);
      toast({
        title: "Error",
        description: "Failed to update course progress. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteCourse = async () => {
    if (!user || !course) return;
    
    try {
      await updateCourseProgress(user.id, course.id, "completed", course.category_id);
      setProgress(100);
      toast({
        title: "Congratulations!",
        description: "You have completed this course. Your certificate is ready.",
      });
      setShowCertificate(true);
    } catch (error) {
      console.error("Error completing course:", error);
      toast({
        title: "Error",
        description: "Failed to mark course as completed. Please try again.",
        variant: "destructive",
      });
    }
  };

  // New function to handle marking external courses as complete
  const handleMarkExternalCourseComplete = async () => {
    if (!user || !course) return;
    
    try {
      await updateCourseProgress(user.id, course.id, "completed", course.category_id);
      setProgress(100);
      toast({
        title: "Congratulations!",
        description: "You have completed this course. Your certificate is ready.",
      });
      setShowCertificate(true);
    } catch (error) {
      console.error("Error completing course:", error);
      toast({
        title: "Error",
        description: "Failed to mark course as completed. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="emerge-container py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!course) {
    return (
      <MainLayout>
        <div className="emerge-container py-12">
          <div className="text-center">
            <h1 className="emerge-heading text-2xl">Course Not Found</h1>
            <p className="my-4">The requested course could not be found.</p>
            <Button onClick={() => navigate("/education")}>Return to Courses</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-emerge-darkBg text-white py-12">
        <div className="emerge-container">
          <button 
            onClick={() => navigate("/education")}
            className="flex items-center text-emerge-gold hover:underline mb-4"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to courses
          </button>
          
          <h1 className="emerge-heading text-4xl mb-4">{course.title}</h1>
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-emerge-gold text-black px-3 py-1 text-xs uppercase">
              {course.levelName || (course.category_id === "beginner" ? "BEGINNER" : 
                course.category_id === "intermediate" ? "INTERMEDIATE" : 
                course.category_id === "advanced" ? "ADVANCED" : "GENERAL")}
            </span>
            <div className="flex items-center text-sm">
              <Clock size={16} className="mr-1" />
              <span>{course.duration || "Self-paced"}</span>
            </div>
          </div>
          <p className="text-lg max-w-3xl">{course.summary}</p>
        </div>
      </div>

      <div className="emerge-container py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="mb-8">
              <h2 className="emerge-heading text-2xl mb-4">Course Overview</h2>
              <div className="prose max-w-none">
                <p>{course.content || "This comprehensive course covers everything you need to know about fashion design principles, techniques, and industry practices. You'll learn through a combination of video lessons, practical exercises, and real-world examples."}</p>
                <p className="mt-4">By the end of this course, you'll have developed the skills necessary to create your own fashion designs and understand how they fit into the broader industry context.</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="emerge-heading text-2xl mb-4">What You'll Learn</h2>
              <ul className="space-y-2">
                {getCourseObjectives(course.title, course.category_id).map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle size={20} className="text-emerge-gold mr-2 mt-1 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {user && progress === 100 && (
              <div className="mb-8">
                <div className="bg-green-50 border border-green-200 p-6 rounded">
                  <div className="flex items-center mb-4">
                    <Award className="text-emerge-gold mr-2" size={24} />
                    <h3 className="text-xl font-medium">Course Completed</h3>
                  </div>
                  <p className="mb-4">
                    Congratulations on completing this course! Your certificate has been issued
                    and is available for download and sharing.
                  </p>
                  <Button 
                    className="bg-emerge-gold hover:bg-emerge-gold/90"
                    onClick={() => setShowCertificate(true)}
                  >
                    View Certificate
                  </Button>
                </div>
              </div>
            )}

            {!isExternalCourse && (
              <div className="mb-8">
                <h2 className="emerge-heading text-2xl mb-4">Course Content</h2>
                <div className="bg-white p-6 border">
                  <div className="aspect-video bg-gray-200 flex items-center justify-center mb-4">
                    {progress > 0 ? (
                      <div className="text-center">
                        <BookOpen size={48} className="mx-auto mb-2 text-emerge-gold" />
                        <p>Continue watching from where you left off</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <BookOpen size={48} className="mx-auto mb-2 text-emerge-gold" />
                        <p>Start this course to access video content</p>
                      </div>
                    )}
                  </div>
                  
                  {user && progress > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Your progress</span>
                        <span>{progress}% complete</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Add "Mark as Complete" button for external courses when user has started but not completed */}
            {isExternalCourse && user && progress > 0 && progress < 100 && (
              <div className="mb-8">
                <div className="bg-white p-6 border">
                  <h3 className="text-lg font-medium mb-4">Complete External Course</h3>
                  <p className="mb-4">
                    Have you completed the external course content? Click the button below to mark this course as completed
                    and receive your certificate.
                  </p>
                  <Button 
                    className="bg-emerge-gold hover:bg-emerge-gold/90"
                    onClick={handleMarkExternalCourseComplete}
                  >
                    Mark Course Complete
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white border p-6 sticky top-4">
              <div className="aspect-video overflow-hidden mb-4">
                <img 
                  src={course.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop"} 
                  alt={course.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {user && progress > 0 && progress < 100 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Your progress</span>
                    <span>{progress}% complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {user && progress === 100 ? (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded">
                  <div className="flex items-center">
                    <CheckCircle className="text-green-600 mr-2" />
                    <span className="font-medium">Course Completed</span>
                  </div>
                  <Button 
                    className="w-full mt-2 bg-emerge-gold hover:bg-emerge-gold/90"
                    onClick={() => setShowCertificate(true)}
                  >
                    View Certificate
                  </Button>
                </div>
              ) : (
                <Button 
                  className="w-full bg-emerge-gold hover:bg-emerge-gold/90"
                  onClick={progress > 0 && !isExternalCourse ? handleCompleteCourse : handleStartCourse}
                >
                  {isExternalCourse ? (
                    <>
                      <span>Visit Course</span>
                      <ExternalLink size={16} className="ml-1" />
                    </>
                  ) : progress > 0 ? (
                    "Complete Course"
                  ) : (
                    "Start Course"
                  )}
                </Button>
              )}
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Self-paced learning - start and complete at any time</p>
                <p className="mt-2">Earn a certificate upon completion</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">Certificate of Completion</DialogTitle>
          </DialogHeader>
          <div className="p-8 border-4 border-double border-emerge-gold/30 text-center">
            <div className="text-emerge-gold mb-4">EMERGE FASHION ACADEMY INTERNATIONAL</div>
            <h2 className="text-3xl font-serif mb-2">Certificate of Achievement</h2>
            <p className="mb-6">This is to certify that</p>
            <p className="text-xl mb-6">{user?.email || "Student"}</p>
            <p className="mb-6">has successfully completed the course</p>
            <p className="text-xl font-medium mb-8">{course.title}</p>
            <p className="text-sm text-gray-500">Certificate ID: {String(course.id).substring(0, 8)}-{Date.now().toString(36)}</p>
            <p className="text-sm text-gray-500">Issued on: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="flex justify-center">
            <Button>Download Certificate</Button>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

// Helper function to generate course objectives based on course title and category
const getCourseObjectives = (title: string, category: string): string[] => {
  const titleLower = title.toLowerCase();
  const objectives = [];
  
  // General objectives that apply to most courses
  objectives.push("Fundamental principles and their application in fashion");
  
  // Course title specific objectives
  if (titleLower.includes('design')) {
    objectives.push("Design thinking and creative problem-solving techniques");
    objectives.push("Pattern-making techniques for various garment types");
    objectives.push("Collection development from concept to presentation");
  }
  
  if (titleLower.includes('model') || titleLower.includes('portfolio')) {
    objectives.push("Professional portfolio development strategies");
    objectives.push("Runway and photoshoot posing techniques");
    objectives.push("Understanding client expectations and industry standards");
  }
  
  if (titleLower.includes('market') || titleLower.includes('social')) {
    objectives.push("Social media strategy development for fashion brands");
    objectives.push("Content creation and scheduling for maximum engagement");
    objectives.push("Analytics and performance tracking for digital campaigns");
  }
  
  if (titleLower.includes('act') || titleLower.includes('perform')) {
    objectives.push("Performance techniques for camera and stage");
    objectives.push("Character development and emotional expression");
    objectives.push("Industry networking and audition preparation");
  }
  
  // Add level-specific objectives
  if (category === 'beginner') {
    objectives.push("Essential terminology and industry fundamentals");
  } else if (category === 'intermediate') {
    objectives.push("Advanced techniques and professional methodologies");
  } else if (category === 'advanced') {
    objectives.push("Expert-level skills and industry leadership principles");
  }
  
  return objectives;
};

export default CourseDetail;
