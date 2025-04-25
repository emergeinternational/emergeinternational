import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Users, ExternalLink, Book, Link2Off } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  getEducationContent, 
  trackCourseProgress, 
  EducationContent 
} from "../services/educationService";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<EducationContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyContent, setWeeklyContent] = useState<{title: string, content: string}[]>([]);

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

  const handleEnrollClick = async () => {
    if (course) {
      await trackCourseProgress(course.id, course.category_id || '');
      if (course.source_url) {
        window.open(course.source_url, '_blank');
      }
    }
  };

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
        return (
          <div className="mt-8">
            <h2 className="text-xl font-medium mb-4">Watch Lesson</h2>
            <div className="aspect-video w-full">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Video Lesson" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        );
      }
    }

    if (course.content_type === 'weekly') {
      return renderWeeklyContent();
    }

    return null;
  };

  const renderEnrollmentSection = () => {
    if (!course) return null;

    const isEmbeddedVideo = course.content_type === 'video' && isVideoEmbed(course.source_url);
    
    if (isEmbeddedVideo) {
      return (
        <div className="space-y-2">
          <p className="text-gray-700">
            This video lesson is available directly on this page. Click play to begin learning.
          </p>
        </div>
      );
    }

    if (course.source_url && isValidUrl(course.source_url)) {
      const hostname = new URL(course.source_url).hostname;
      const platform = hostname.replace('www.', '').split('.')[0];
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

      return (
        <div className="space-y-2">
          <p className="text-gray-700 mb-2">
            Click the course link below to access this course on {platformName}.
          </p>
          <a 
            href={course.source_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-emerge-gold hover:bg-emerge-gold/90 text-white px-4 py-2 rounded inline-flex items-center justify-center"
            onClick={handleEnrollClick}
          >
            <ExternalLink className="mr-2 h-4 w-4" /> Visit Course
          </a>
          <p className="text-center text-xs text-gray-500 flex items-center justify-center mt-2">
            <Link2Off className="mr-2 h-3 w-3 text-emerge-gold" />
            You'll be redirected to {hostname}
          </p>
        </div>
      );
    }

    // Missing or invalid link
    return (
      <div className="p-4 border border-yellow-200 bg-yellow-50 rounded">
        <p className="text-orange-700">External course link coming soon. Check back within 24 hours.</p>
      </div>
    );
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const getNextStartDate = () => {
    const now = new Date();
    const daysToAdd = Math.floor(Math.random() * 14) + 1;
    now.setDate(now.getDate() + daysToAdd);
    return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const renderWeeklyContent = () => {
    if (!weeklyContent.length) return null;
    
    return (
      <div className="mt-8">
        <h2 className="text-xl font-medium mb-4">Course Content</h2>
        <Accordion type="single" collapsible className="w-full">
          {weeklyContent.map((week, index) => (
            <AccordionItem key={index} value={`week-${index}`}>
              <AccordionTrigger className="text-left">{week.title}</AccordionTrigger>
              <AccordionContent>
                <p className="text-gray-700">{week.content}</p>
                <Button className="mt-4 bg-emerge-gold hover:bg-emerge-gold/90">Access Materials</Button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    );
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
              <div className="mb-8">
                <h1 className="emerge-heading text-3xl mb-4">{course.title}</h1>
                {course.talent_type && (
                  <Badge className="bg-emerge-gold text-white mb-4">
                    {course.talent_type.charAt(0).toUpperCase() + course.talent_type.slice(1)}
                  </Badge>
                )}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  {!isVideoEmbed(course.source_url) && (
                    <>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-emerge-gold" />
                        <span>Next Start: {getNextStartDate()}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-emerge-gold" />
                        <span>Capacity: 15-20 students</span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center">
                    <Book className="mr-2 h-4 w-4 text-emerge-gold" />
                    <span>Level: {course.level || 'Beginner'}</span>
                  </div>
                </div>
              </div>

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
                  <div className="bg-emerge-cream p-5">
                    <h3 className="text-lg font-medium mb-4">Course Information</h3>
                    {renderEnrollmentSection()}
                  </div>
                  
                  {/* Similar Courses */}
                  <div className="mt-6 bg-white border border-gray-200 p-5">
                    <h3 className="text-lg font-medium mb-3">Similar Courses</h3>
                    <ul className="space-y-3 text-sm">
                      {course.talent_type && (
                        <li>
                          <a 
                            href={`/education?talent=${course.talent_type}`} 
                            className="text-emerge-gold hover:underline"
                          >
                            More {course.talent_type.charAt(0).toUpperCase() + course.talent_type.slice(1)} Courses
                          </a>
                        </li>
                      )}
                      <li>
                        <a href="/education" className="text-emerge-gold hover:underline">
                          View More {course.level || 'Beginner'} Courses
                        </a>
                      </li>
                      <li>
                        <a href="/education" className="text-emerge-gold hover:underline">
                          Browse All Categories
                        </a>
                      </li>
                    </ul>
                  </div>
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
