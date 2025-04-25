
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  getEducationContent,
  trackCourseProgress,
  EducationContent,
  WeeklyContent as WeeklyContentType
} from "../services/education";

// Import our new components
import CourseOverview from "@/components/education/CourseOverview";
import VideoPlayer from "@/components/education/VideoPlayer";
import WeeklyContent from "@/components/education/WeeklyContent";
import CourseInfoSidebar from "@/components/education/CourseInfoSidebar";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<EducationContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyContent, setWeeklyContent] = useState<WeeklyContentType[]>([]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const allCourses = await getEducationContent();
        const foundCourse = allCourses.find(c => c.id === id);
        
        if (foundCourse) {
          setCourse(foundCourse);
          if (foundCourse.content_type === 'weekly') {
            setWeeklyContent([
              {
                title: "Week 1: Introduction to Design Principles",
                content: "This week covers the fundamentals of design thinking and principles that form the foundation of fashion design. You'll learn about color theory, balance, proportion, and how these elements work together."
              },
              {
                title: "Week 2: Creating Mood Boards",
                content: "Learn how to create effective mood boards that communicate your vision and inspiration. We'll cover digital and physical techniques for mood board creation."
              },
              {
                title: "Week 3: Material Selection",
                content: "Explore different fabric types, textures, and materials used in fashion design. Learn how to select the right materials for your designs based on purpose, season, and target market."
              }
            ]);
          }
        } else {
          toast({
            title: "Course not found",
            description: "The requested course could not be found.",
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
  }, [id, toast]);

  const isVideoEmbed = (url?: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const getVideoId = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1];
    }
    return null;
  };

  const renderContentSection = () => {
    if (!course) return null;

    if (course.content_type === 'video' && course.source_url && isVideoEmbed(course.source_url)) {
      const videoId = getVideoId(course.source_url);
      if (videoId) {
        return <VideoPlayer videoId={videoId} source={course.source_url} />;
      }
    }

    if (course.content_type === 'weekly') {
      return <WeeklyContent weeklyContent={weeklyContent} />;
    }

    return null;
  };

  return (
    <MainLayout>
      <div className="emerge-container py-16">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center"
            onClick={() => navigate('/education')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Button>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-emerge-gold">Loading course details...</div>
            </div>
          ) : course ? (
            <div>
              {/* Course Header */}
              <CourseOverview course={course} />

              {/* Course Content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-medium mb-4">Course Overview</h2>
                  <p className="text-gray-700 mb-6">
                    {course.summary || "No description available."}
                  </p>
                  
                  {renderContentSection()}
                </div>
                
                <div>
                  <CourseInfoSidebar course={course} />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-emerge-cream p-6">
              <p className="text-lg">Course not found</p>
              <p className="text-gray-600 mt-2">The requested course could not be found.</p>
              <Button 
                className="mt-4 bg-emerge-gold hover:bg-emerge-gold/90"
                onClick={() => navigate('/education')}
              >
                Browse All Courses
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseDetail;
