
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Users, ExternalLink, Book, Link2Off } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { getEducationContent, EducationContent, trackCourseProgress } from "../services/educationService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [course, setCourse] = useState<EducationContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyContent, setWeeklyContent] = useState<{title: string, content: string}[]>([]);

  // Default values for when course data is loading or not available
  const courseType = course?.content_type || 'online course';
  const formattedDuration = course?.content_type === 'workshop' ? '3-5 hours' : '10-15 hours';
  const courseLevel = course?.level || course?.category_id || "beginner";
  const formattedLevel = courseLevel.charAt(0).toUpperCase() + courseLevel.slice(1);
  const talentType = course?.talent_type || '';
  const formattedTalentType = talentType ? talentType.charAt(0).toUpperCase() + talentType.slice(1) : '';

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const allCourses = await getEducationContent();
        let foundCourse = allCourses.find(c => c.id === id);
        
        if (!foundCourse) {
          try {
            const numericId = parseInt(id).toString();
            foundCourse = allCourses.find(c => c.id === numericId);
          } catch (e) {
            console.log("ID is not numeric, skipping parseInt fallback");
          }
        }
        
        if (foundCourse) {
          setCourse(foundCourse);
          
          // Simulate weekly content (in a real app, this would come from the database)
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
          console.log("Course found:", foundCourse);
        } else {
          console.error("Course not found with ID:", id);
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
  
  const getNextStartDate = () => {
    const now = new Date();
    const daysToAdd = Math.floor(Math.random() * 14) + 1;
    now.setDate(now.getDate() + daysToAdd);
    return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const nextStartDate = getNextStartDate();

  const handleEnrollClick = async () => {
    if (course) {
      await trackCourseProgress(course.id, course.category_id || '');
      if (course.source_url) {
        window.open(course.source_url, '_blank');
      }
    }
  };

  const renderCourseLink = () => {
    if (!course) return null;
    
    // For weekly content hosted on our platform
    if (course.content_type === 'weekly') {
      return (
        <div className="space-y-2">
          <p className="text-gray-700 mb-2">
            This course is available directly on Emerge International. Lessons will be released weekly.
          </p>
          <Button 
            onClick={handleEnrollClick}
            className="w-full bg-emerge-gold hover:bg-emerge-gold/90"
          >
            Start Learning Now
          </Button>
        </div>
      );
    }
    
    // For external links
    if (course?.source_url) {
      const isValidLink = isValidUrl(course.source_url);
      const hostname = isValidLink ? new URL(course.source_url).hostname : '';
      const platform = hostname.replace('www.', '').split('.')[0];
      const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
      
      return (
        <div className="space-y-2">
          {isValidLink ? (
            <>
              <p className="text-gray-700 mb-2">
                Access this course on {platformName} by clicking the link below.
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
              <p className="text-center text-xs text-gray-500 flex items-center justify-center">
                <Link2Off className="mr-2 h-3 w-3 text-emerge-gold" />
                You'll be redirected to {hostname}
              </p>
            </>
          ) : (
            <div className="p-4 border border-yellow-200 bg-yellow-50 rounded">
              <p className="text-orange-700 mb-2">External course link coming soon. Check back within 24 hours.</p>
            </div>
          )}
        </div>
      );
    } else {
      // No link available
      return (
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded">
          <p className="text-orange-700 mb-2">External course link coming soon. Check back within 24 hours.</p>
        </div>
      );
    }
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

  const renderVideoEmbed = () => {
    if (!course || course.content_type !== 'video' || !course.source_url) return null;
    
    // Simple YouTube embed check - would need to be extended for other providers
    if (course.source_url.includes('youtube.com') || course.source_url.includes('youtu.be')) {
      let videoId = '';
      
      if (course.source_url.includes('youtube.com/watch?v=')) {
        videoId = course.source_url.split('v=')[1].split('&')[0];
      } else if (course.source_url.includes('youtu.be/')) {
        videoId = course.source_url.split('youtu.be/')[1];
      }
      
      if (videoId) {
        return (
          <div className="mt-8">
            <h2 className="text-xl font-medium mb-4">Watch Lesson</h2>
            <div className="aspect-video">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        );
      }
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
              <div className="mb-8">
                <h1 className="emerge-heading text-3xl mb-4">{course.title}</h1>
                {talentType && (
                  <Badge className="bg-emerge-gold text-white mb-4">
                    {formattedTalentType}
                  </Badge>
                )}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-emerge-gold" />
                    <span>Duration: {formattedDuration}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-emerge-gold" />
                    <span>Next Start: {nextStartDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-emerge-gold" />
                    <span>Capacity: 15-20 students</span>
                  </div>
                  <div className="flex items-center">
                    <Book className="mr-2 h-4 w-4 text-emerge-gold" />
                    <span>Level: {formattedLevel}</span>
                  </div>
                </div>
              </div>

              <div className="aspect-video mb-8 overflow-hidden bg-emerge-cream">
                {course.image_url && (
                  <img 
                    src={course.image_url} 
                    alt={course.title} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-medium mb-4">Course Overview</h2>
                  <p className="text-gray-700 mb-6">
                    {course.summary || "No description available."}
                  </p>
                  
                  <h2 className="text-xl font-medium mb-4">What You'll Learn</h2>
                  <ul className="list-disc pl-5 mb-6 space-y-2">
                    <li>Understanding fundamentals and principles of the subject matter</li>
                    <li>Practical skills development through hands-on exercises</li>
                    <li>Professional-level techniques and industry best practices</li>
                    <li>Building a portfolio and showcasing your work effectively</li>
                    <li>Career opportunities and networking in the industry</li>
                  </ul>
                  
                  {/* Render video embed if available */}
                  {renderVideoEmbed()}
                  
                  {/* Render weekly content if available */}
                  {renderWeeklyContent()}
                  
                  {/* Add How to Enroll section */}
                  <h2 className="text-xl font-medium mb-4 mt-6">How to Enroll</h2>
                  <p className="text-gray-700 mb-4">
                    {course.content_type === 'weekly' ? (
                      "Access this course directly on Emerge International. Content will be released weekly."
                    ) : (
                      <>
                        Click the course link below to sign up and begin learning 
                        {course.source_url && isValidUrl(course.source_url) ? (
                          <> on {new URL(course.source_url).hostname.replace('www.', '')}</>
                        ) : (
                          <> on the original platform</>
                        )}
                        .
                      </>
                    )}
                    {nextStartDate ? (
                      <span> This course begins on {nextStartDate}.</span>
                    ) : (
                      <span> Start anytime — this course is available on-demand.</span>
                    )}
                  </p>
                  
                  <div className="p-4 bg-emerge-cream mt-8 rounded-sm">
                    <h3 className="font-medium mb-2">Course Updates</h3>
                    <p className="text-sm text-gray-600">
                      This course content is automatically curated from top educational platforms and updated weekly
                      to ensure you have access to the most current learning materials.
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="bg-emerge-cream p-5">
                    <h3 className="text-lg font-medium mb-4">Course Information</h3>
                    <div className="space-y-3">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span className="capitalize">{courseType}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="capitalize">{formattedLevel}</span>
                      </p>
                      {talentType && (
                        <p className="flex justify-between">
                          <span className="text-gray-600">For:</span>
                          <span className="capitalize">{formattedTalentType}</span>
                        </p>
                      )}
                      <p className="flex justify-between">
                        <span className="text-gray-600">Prerequisites:</span>
                        <span>None</span>
                      </p>
                      {course.source_url && isValidUrl(course.source_url) && (
                        <p className="flex justify-between">
                          <span className="text-gray-600">Provider:</span>
                          <span>{new URL(course.source_url).hostname.replace('www.', '')}</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      {renderCourseLink()}
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-white border border-gray-200 p-5">
                    <h3 className="text-lg font-medium mb-3">Similar Courses</h3>
                    <ul className="space-y-3 text-sm">
                      {talentType && (
                        <li>
                          <a 
                            href={`/education?talent=${talentType}`} 
                            className="text-emerge-gold hover:underline"
                          >
                            More {formattedTalentType} Courses
                          </a>
                        </li>
                      )}
                      <li>
                        <a href="/education" className="text-emerge-gold hover:underline">
                          View More {formattedLevel} Courses
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
