
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import MainLayout from "../layouts/MainLayout";
import CourseCard from "../components/education/CourseCard";
import { Button } from "@/components/ui/button";
import { 
  getEducationContent, 
  getEducationCategories,
  EducationContent,
  EducationCategory
} from "../services/educationService";
import { useToast } from "@/hooks/use-toast";

const CourseCategory = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState<EducationCategory | null>(null);
  const [courses, setCourses] = useState<EducationContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categoryId) return;
      
      try {
        setIsLoading(true);
        
        // Fetch the category details
        const categories = await getEducationCategories();
        const foundCategory = categories.find(c => c.id === categoryId);
        
        // Fetch courses for this category
        const coursesData = await getEducationContent(categoryId);
        
        if (foundCategory) {
          setCategory(foundCategory);
          setCourses(coursesData);
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

    fetchCategoryData();
  }, [categoryId, toast]);

  return (
    <MainLayout>
      <div className="emerge-container py-16">
        <div className="max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-6 flex items-center"
            onClick={() => navigate('/education')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Categories
          </Button>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-emerge-gold">Loading category data...</div>
            </div>
          ) : category ? (
            <>
              <div className="mb-10">
                <h1 className="emerge-heading text-4xl mb-4 capitalize">{category.name} Courses</h1>
                {category.description && (
                  <p className="text-lg text-gray-600">{category.description}</p>
                )}
              </div>

              {courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {courses.map(course => (
                    <CourseCard
                      key={course.id}
                      id={parseInt(course.id.substring(0, 8), 16)}
                      name={course.title}
                      level={course.category_id}
                      description={course.summary || ""}
                      image={course.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop"}
                      duration={course.content_type === "course" ? "10-12 weeks" : "1-2 days"}
                      levelName={category.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-emerge-cream p-6">
                  <p className="text-lg">No courses available for this category yet.</p>
                  <p className="text-gray-600 mt-2">Please check back soon for new content!</p>
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
                Browse All Categories
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CourseCategory;
