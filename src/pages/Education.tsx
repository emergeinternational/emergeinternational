import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { GraduationCap, BookOpen, Library, ExternalLink, Clock, Calendar } from "lucide-react";
import CourseCard from "../components/education/CourseCard";
import TalentCategoryFilter from "../components/education/TalentCategoryFilter";
import UpcomingWorkshops from "../components/education/UpcomingWorkshops";
import { 
  loadCategories, 
  loadFilteredCourses,
  SimpleCourse,
  SimpleCategory
} from "../services/education/simpleCourseService";
import { useToast } from "@/hooks/use-toast";

const PLACEHOLDER_WORKSHOPS = [
  {
    id: 1,
    name: "Fashion Photography Workshop",
    date: "June 15, 2025",
    location: "Addis Ababa",
    spots: 8
  },
  {
    id: 2,
    name: "Sustainable Design Masterclass",
    date: "June 24, 2025",
    location: "Virtual",
    spots: 15
  },
  {
    id: 3,
    name: "Portfolio Building Session",
    date: "July 5, 2025",
    location: "Addis Ababa",
    spots: 10
  }
];

const Education = () => {
  const [activeLevel, setActiveLevel] = useState("all");
  const [activeTalentType, setActiveTalentType] = useState("all");
  const [categories, setCategories] = useState<SimpleCategory[]>([]);
  const [educationContent, setEducationContent] = useState<SimpleCourse[]>([]);
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
        
        // Fetch categories and education content
        const categoriesData = await loadCategories();
        setCategories(categoriesData);
        
        // For "all", pass undefined as categoryId to get all content
        // For specific categories, pass the category ID
        const contentData = await loadFilteredCourses(
          activeLevel === "all" ? undefined : activeLevel,
          activeTalentType === "all" ? undefined : activeTalentType
        );
        
        console.log(`Fetched ${contentData.length} courses for category: ${activeLevel} and talent type: ${activeTalentType}`);
        setEducationContent(contentData);
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
  }, [activeLevel, activeTalentType, toast]);

  console.log(`Displaying ${educationContent.length} courses after filtering`);

  return (
    <MainLayout>
      <section className="bg-emerge-darkBg text-white py-16">
        <div className="emerge-container">
          <div className="max-w-3xl">
            <h1 className="emerge-heading text-5xl mb-6">Emerge Fashion Academy</h1>
            <p className="text-xl mb-8">
              Discover our comprehensive range of courses and workshops designed to develop 
              the next generation of African creative talent. From models and designers to photographers 
              and entertainment talent, learn from industry experts and build your future in the creative industry.
            </p>
            <div className="flex gap-4 flex-wrap">
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
        <TalentCategoryFilter 
          activeCategory={activeTalentType} 
          onChange={setActiveTalentType}
        />
        
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
        ) : educationContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {educationContent.map(course => (
              <CourseCard
                key={course.id}
                id={course.id}
                name={course.title}
                level={course.category_id || ""}
                description={course.summary || ""}
                image={course.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop"}
                duration={course.content_type === "course" ? "10-12 weeks" : "1-2 days"}
                levelName={categories.find(c => c.id === course.category_id)?.name || course.level || ""}
                talentType={course.talent_type}
                contentType={course.content_type}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-emerge-cream p-6 mb-16">
            <p className="text-lg">No content available for {activeTalentType !== 'all' ? activeTalentType : ''} {activeLevel !== 'all' ? activeLevel : ''} category.</p>
            <p className="text-gray-600 mt-2">New courses for this category will be available soon. Stay tuned!</p>
          </div>
        )}
        
        <UpcomingWorkshops workshops={PLACEHOLDER_WORKSHOPS} />
        
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
