
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CourseCard from "@/components/education/CourseCard";
import TalentCategoryFilter from "@/components/education/TalentCategoryFilter";
import { loadCourses, SimpleCourse } from "@/services/education/simpleCourseService";

// Sample categories for the simplified approach
const CATEGORIES = [
  { id: "modeling", name: "Modeling", description: "Courses for aspiring and professional models" },
  { id: "design", name: "Design", description: "Fashion design courses from basics to advanced techniques" },
  { id: "business", name: "Business", description: "Business skills for the fashion industry" },
  { id: "photography", name: "Photography", description: "Fashion photography courses and workshops" }
];

const CourseCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState<{ id: string; name: string; description: string } | null>(null);
  const [courses, setCourses] = useState<SimpleCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTalentFilter, setActiveTalentFilter] = useState<string>("all");

  useEffect(() => {
    const fetchCategoryAndCourses = async () => {
      if (!categoryId) return;

      try {
        setIsLoading(true);
        
        // Find category from our static list
        const foundCategory = CATEGORIES.find(c => c.id === categoryId);
        
        if (foundCategory) {
          setCategory(foundCategory);
          
          // Load all courses and filter by category
          const allCourses = await loadCourses();
          const categoryCourses = allCourses.filter(course => course.category_id === categoryId);
          setCourses(categoryCourses);
        } else {
          toast({
            title: "Category not found",
            description: "The requested category could not be found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
        toast({
          title: "Error",
          description: "Failed to load category data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryAndCourses();
  }, [categoryId, toast]);

  const handleTalentFilterChange = (filter: string) => {
    setActiveTalentFilter(filter);
  };

  const getFilteredCourses = () => {
    if (activeTalentFilter === "all") {
      return courses;
    }
    return courses.filter(course => course.talent_type === activeTalentFilter);
  };

  const filteredCourses = getFilteredCourses();

  return (
    <MainLayout>
      <div className="emerge-container py-16">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center"
            onClick={() => navigate('/education')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Education Center
          </Button>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-emerge-gold">Loading category...</div>
            </div>
          ) : category ? (
            <>
              <div className="mb-8">
                <h1 className="emerge-heading text-4xl mb-4">{category.name} Courses</h1>
                <p className="text-lg text-gray-600">{category.description}</p>
              </div>

              <TalentCategoryFilter 
                activeFilter={activeTalentFilter} 
                onFilterChange={handleTalentFilterChange} 
              />

              {filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      id={course.id}
                      name={course.title}
                      description={course.description || "No description available"}
                      image={course.image_url || "https://images.unsplash.com/photo-1531297484001-80022131f5a1"}
                      level={course.level || "Beginner"}
                      levelName={course.level || "Beginner"}
                      contentType={course.content_type}
                      talentType={course.talent_type}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-emerge-cream p-6">
                  <p className="text-lg">No courses found in this category and filter.</p>
                  <p className="text-gray-600 mt-2">Try selecting a different talent type filter.</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-emerge-cream p-6">
              <p className="text-lg">Category not found</p>
              <p className="text-gray-600 mt-2">The requested category could not be found.</p>
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

export default CourseCategory;
