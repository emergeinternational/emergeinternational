
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Users, ExternalLink } from "lucide-react";
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
        // Convert the route param (which is a numeric id) to fetch the actual content
        // In a production app, we'd use the actual UUID from the database
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
          // Don't navigate away, just show the error
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
                    <span>Duration: {course.content_type === "course" ? "10-12 weeks" : "1-2 days"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-emerge-gold" />
                    <span>Next Start: {new Date().toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-emerge-gold" />
                    <span>Capacity: 15-20 students</span>
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
                </div>
                
                <div>
                  <div className="bg-emerge-cream p-5">
                    <h3 className="text-lg font-medium mb-4">Course Information</h3>
                    <div className="space-y-3">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Format:</span>
                        <span>{course.content_type === "course" ? "In-person" : "Workshop"}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="capitalize">{course.category_id}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Prerequisites:</span>
                        <span>None</span>
                      </p>
                    </div>
                    
                    <div className="mt-6">
                      <Button className="w-full bg-emerge-gold hover:bg-emerge-gold/90">
                        Enroll Now
                      </Button>
                      
                      {course.source_url && (
                        <a 
                          href={course.source_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center mt-4 text-sm text-emerge-gold hover:underline"
                        >
                          More Information <ExternalLink size={14} className="ml-1" />
                        </a>
                      )}
                    </div>
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
