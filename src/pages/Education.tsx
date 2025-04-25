import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { GraduationCap, BookOpen, Library, ExternalLink, Clock, Calendar } from "lucide-react";
import CourseCard from "../components/education/CourseCard";
import UpcomingWorkshops from "../components/education/UpcomingWorkshops";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getEducationCategories, 
  getEducationContent,
  EducationCategory, 
  EducationContent 
} from "../services/educationService";
import { getWorkshops, Workshop } from "../services/workshopService";
import { useToast } from "@/hooks/use-toast";

const Education = () => {
  const [activeLevel, setActiveLevel] = useState("all");
  const [categories, setCategories] = useState<EducationCategory[]>([]);
  const [educationContent, setEducationContent] = useState<EducationContent[]>([]);
  const [upcomingWorkshops, setUpcomingWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const levels = [
    { id: "beginner", name: "BEGINNER" },
    { id: "intermediate", name: "INTERMEDIATE" },
    { id: "advanced", name: "ADVANCED" },
    { id: "workshop", name: "WORKSHOPS" },
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch categories, education content, and workshops
        const categoriesData = await getEducationCategories();
        setCategories(categoriesData);
        
        // For "all", pass undefined as categoryId to get all content
        // For specific categories, pass the category ID
        const contentData = await getEducationContent(
          activeLevel === "all" ? undefined : activeLevel,
          20
        );
        
        console.log(`Fetched ${contentData.length} courses for category: ${activeLevel}`);
        setEducationContent(contentData);
        
        const workshopsData = await getWorkshops();
        setUpcomingWorkshops(workshopsData.slice(0, 3));
        
      } catch (error) {
        console.error("Error fetching education data:", error);
        toast({
          title: "Error",
          description: "Failed to load education content. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeLevel, toast]);

  // When activeLevel is "all", we want to show all content, not filter
  // For specific levels, filter according to the category ID
  const filteredCourses = activeLevel === "all" 
    ? educationContent 
    : educationContent.filter(content => content.category_id === activeLevel);

  console.log(`Displaying ${filteredCourses.length} courses after filtering`);

  // Format workshop data for the component
  const formattedWorkshops = upcomingWorkshops.map(workshop => ({
    id: typeof workshop.id === 'string' ? 
      (workshop.id.startsWith('0x') ? parseInt(workshop.id.substring(0, 8), 16) : workshop.id) : 
      workshop.id,
    name: workshop.name,
    date: new Date(workshop.date).toLocaleDateString('en-US', {
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    }),
    location: workshop.location,
    spots: workshop.spots
  }));

  return (
    <MainLayout>
      <section className="bg-emerge-darkBg text-white py-16">
        <div className="emerge-container">
          <div className="max-w-3xl">
            <h1 className="emerge-heading text-5xl mb-6">Emerge Fashion Academy</h1>
            <p className="text-xl mb-8">
              Discover our comprehensive range of courses and workshops designed to develop 
              the next generation of African fashion talent. From beginner to advanced levels, 
              learn from industry experts and build your future in fashion.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-emerge-gold" size={24} />
                <span>Expert Instructors</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="text-emerge-gold" size={24} />
                <span>Hands-on Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <Library className="text-emerge-gold" size={24} />
                <span>Industry Recognition</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="emerge-container py-12">
        <div className="mb-12 flex overflow-x-auto pb-2 hide-scrollbar">
          <button
            onClick={() => setActiveLevel("all")}
            className={`px-4 py-2 mr-2 whitespace-nowrap ${
              activeLevel === "all"
                ? "text-emerge-gold border-b-2 border-emerge-gold"
                : "text-gray-600"
            }`}
          >
            ALL
          </button>
          {levels.map(level => (
            <button
              key={level.id}
              onClick={() => setActiveLevel(level.id)}
              className={`px-4 py-2 mr-2 whitespace-nowrap ${
                activeLevel === level.id
                  ? "text-emerge-gold border-b-2 border-emerge-gold"
                  : "text-gray-600"
              }`}
            >
              {level.name}
            </button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-emerge-gold">Loading educational content...</div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredCourses.map(course => (
              <CourseCard
                key={course.id}
                id={course.id}
                name={course.title}
                level={course.category_id}
                description={course.summary || ""}
                image={course.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop"}
                duration={course.content_type === "course" ? "10-12 weeks" : "1-2 days"}
                levelName={levels.find(l => l.id === course.category_id)?.name || course.category_id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-emerge-cream p-6 mb-16">
            <p className="text-lg">No content available for this category.</p>
            <p className="text-gray-600 mt-2">Please check back soon for new content!</p>
          </div>
        )}
        
        <UpcomingWorkshops workshops={formattedWorkshops} />
        
        <section className="mt-16">
          <h2 className="emerge-heading text-2xl mb-6">Latest Fashion Resources</h2>
          <div className="bg-emerge-cream p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 border border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Calendar size={20} className="text-emerge-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium">Industry Insights</h3>
                    <p className="text-sm text-gray-600 mb-2">Latest articles from fashion industry experts</p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center justify-between">
                        <span>Sustainability Trends in 2025</span>
                        <a href="https://www.voguebusiness.com/sustainability" target="_blank" rel="noopener noreferrer" className="text-emerge-gold">
                          <ExternalLink size={14} />
                        </a>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>African Textiles: Global Impact</span>
                        <a href="https://www.businessoffashion.com/articles/" target="_blank" rel="noopener noreferrer" className="text-emerge-gold">
                          <ExternalLink size={14} />
                        </a>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Digital Fashion Marketplaces</span>
                        <a href="https://www.notjustalabel.com/editorial" target="_blank" rel="noopener noreferrer" className="text-emerge-gold">
                          <ExternalLink size={14} />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bg-white p-5 border border-gray-100">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Clock size={20} className="text-emerge-gold" />
                  </div>
                  <div>
                    <h3 className="font-medium">Video Tutorials</h3>
                    <p className="text-sm text-gray-600 mb-2">Curated video lessons from fashion professionals</p>
                    <ul className="text-sm space-y-2">
                      <li className="flex items-center justify-between">
                        <span>Pattern Making for Beginners</span>
                        <a href="https://www.youtube.com/results?search_query=pattern+making+for+beginners" target="_blank" rel="noopener noreferrer" className="text-emerge-gold">
                          <ExternalLink size={14} />
                        </a>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Social Media for Fashion Brands</span>
                        <a href="https://www.youtube.com/results?search_query=social+media+for+fashion+brands" target="_blank" rel="noopener noreferrer" className="text-emerge-gold">
                          <ExternalLink size={14} />
                        </a>
                      </li>
                      <li className="flex items-center justify-between">
                        <span>Sustainable Fabric Selection</span>
                        <a href="https://www.youtube.com/results?search_query=sustainable+fabric+selection" target="_blank" rel="noopener noreferrer" className="text-emerge-gold">
                          <ExternalLink size={14} />
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="mt-16">
          <h2 className="emerge-heading text-2xl mb-6">Internationally Certified Courses</h2>
          <div className="bg-white border p-8 max-w-3xl">
            <p className="mb-6 text-lg">
              Our fashion education programs are certified by leading international fashion 
              institutions, ensuring your learning meets global industry standards. Graduates 
              receive recognized certifications valued by employers worldwide.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              <div className="aspect-square bg-emerge-cream flex items-center justify-center p-4">
                <span className="text-sm text-gray-600 text-center">Fashion Institute of Design</span>
              </div>
              <div className="aspect-square bg-emerge-cream flex items-center justify-center p-4">
                <span className="text-sm text-gray-600 text-center">International Fashion Council</span>
              </div>
              <div className="aspect-square bg-emerge-cream flex items-center justify-center p-4">
                <span className="text-sm text-gray-600 text-center">African Fashion Alliance</span>
              </div>
              <div className="aspect-square bg-emerge-cream flex items-center justify-center p-4">
                <span className="text-sm text-gray-600 text-center">Global Design Institute</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Education;
