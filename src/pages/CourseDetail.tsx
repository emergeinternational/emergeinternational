
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Users, ExternalLink, Book } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import { getEducationContent, EducationContent } from "../services/educationService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [course, setCourse] = useState<EducationContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const courseId = parseInt(id).toString();
        const allCourses = await getEducationContent();
        const foundCourse = allCourses.find(c => c.id === courseId);
        
        if (foundCourse) {
          setCourse(foundCourse);
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
  }, [id, toast, navigate]);

  const courseLevel = course?.category_id || "beginner";
  const formattedLevel = courseLevel.charAt(0).toUpperCase() + courseLevel.slice(1);
  const courseType = course?.content_type || "course";
  const formattedDuration = courseType === "course" ? "10-12 weeks" : "1-2 days";
  
  const getNextStartDate = () => {
    const now = new Date();
    const daysToAdd = Math.floor(Math.random() * 14) + 1;
    now.setDate(now.getDate() + daysToAdd);
    return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const nextStartDate = getNextStartDate();

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
                      <p className="flex justify-between">
                        <span className="text-gray-600">Prerequisites:</span>
                        <span>None</span>
                      </p>
                      {course.source_url ? (
                        <p className="flex justify-between">
                          <span className="text-gray-600">Provider:</span>
                          <span>{course.source_url}</span>
                        </p>
                      ) : (
                        <p className="flex justify-between">
                          <span className="text-gray-600">Provider:</span>
                          <span>None</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      {course.source_url ? (
                        <div>
                          <a 
                            href={course.source_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full bg-emerge-gold hover:bg-emerge-gold/90 text-white px-4 py-2 rounded inline-flex items-center justify-center"
                          >
                            Start Learning Now
                          </a>
                          <p className="text-center text-xs text-gray-500 mt-2">
                            You'll be redirected to the course provider
                          </p>
                        </div>
                      ) : (
                        <Button className="w-full bg-emerge-gold hover:bg-emerge-gold/90">
                          Enroll Now
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6 bg-white border border-gray-200 p-5">
                    <h3 className="text-lg font-medium mb-3">Similar Courses</h3>
                    <ul className="space-y-3 text-sm">
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
