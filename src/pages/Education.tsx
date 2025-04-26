import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { GraduationCap, BookOpen, Library, ExternalLink, Clock, Calendar, AlertTriangle } from "lucide-react";
import CourseCard from "../components/education/CourseCard";
import UpcomingWorkshops from "../components/education/UpcomingWorkshops";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getEducationCategories, 
  getEducationContent,
  EducationCategory
} from "../services/educationService";
import { getWorkshops, Workshop } from "../services/workshopService";
import { getCourses, Course, getStaticCourses } from "../services/courseService";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const careerInterests = [
  { id: "all", name: "ALL CAREERS" },
  { id: "model", name: "MODEL", image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=160&auto=format&fit=crop" },
  { id: "designer", name: "DESIGNER", image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=160&auto=format&fit=crop" },
  { id: "actor", name: "ACTOR", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=160&auto=format&fit=crop" },
  { id: "photographer", name: "PHOTOGRAPHER", image: "https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=160&auto=format&fit=crop" },
  { id: "videographer", name: "VIDEOGRAPHER", image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=160&auto=format&fit=crop" },
  { id: "musical_artist", name: "MUSICAL ARTIST", image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=160&auto=format&fit=crop" },
  { id: "fine_artist", name: "FINE ARTIST", image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=160&auto=format&fit=crop" },
  { id: "event_planner", name: "EVENT PLANNER", image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=160&auto=format&fit=crop" },
  { id: "social media influencer", name: "SOCIAL MEDIA", image: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=160&auto=format&fit=crop" },
  { id: "entertainment talent", name: "ENTERTAINMENT", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=160&auto=format&fit=crop" }
];

const Education = () => {
  const [activeLevel, setActiveLevel] = useState("all");
  const [activeCareerInterest, setActiveCareerInterest] = useState("all");
  const [showCareerFilter, setShowCareerFilter] = useState(false);
  const [categories, setCategories] = useState<EducationCategory[]>([]);
  const [educationContent, setEducationContent] = useState<Course[]>([]);
  const [upcomingWorkshops, setUpcomingWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const levels = [
    { id: "beginner", name: "BEGINNER" },
    { id: "intermediate", name: "INTERMEDIATE" },
    { id: "advanced", name: "ADVANCED" },
    { id: "workshop", name: "WORKSHOPS" },
  ];
  
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      
      const categoriesData = await getEducationCategories();
      setCategories(categoriesData);
      
      const contentData = await getCourses(
        activeLevel === "all" ? undefined : activeLevel,
        20,
        false,
        activeCareerInterest === "all" ? undefined : activeCareerInterest
      );
      
      if (contentData && contentData.length > 0) {
        setEducationContent(contentData);
      } else {
        let staticCourses = getStaticCourses();
        
        if (activeLevel !== "all") {
          staticCourses = staticCourses.filter(course => course.category_id === activeLevel);
        }
        
        if (activeCareerInterest !== "all") {
          staticCourses = staticCourses.filter(course => 
            course.career_interests?.includes(activeCareerInterest)
          );
        }
        
        setEducationContent(staticCourses);
      }
      
      const workshopsData = await getWorkshops();
      setUpcomingWorkshops(workshopsData.slice(0, 3));
      
    } catch (error) {
      console.error("Error fetching education data:", error);
      toast({
        title: "Error",
        description: "Failed to load education content. Please try again later.",
        variant: "destructive",
      });
      
      setEducationContent(getStaticCourses());
      
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCourses();
  }, [activeLevel, activeCareerInterest, toast]);

  const isValidUrl = (url?: string): boolean => {
    if (!url) return false;
    
    try {
      new URL(url);
      const lowercaseUrl = url.toLowerCase();
      return (
        !lowercaseUrl.includes('example.com') && 
        !lowercaseUrl.includes('placeholder') && 
        !lowercaseUrl.includes('localhost')
      );
    } catch (e) {
      return false;
    }
  };

  const formattedWorkshops = upcomingWorkshops.map(workshop => ({
    id: workshop.id,
    name: workshop.name,
    date: new Date(workshop.date).toLocaleDateString('en-US', {
      month: 'long', 
      day: 'numeric', 
      year: 'numeric'
    }),
    location: workshop.location,
    spots: workshop.spots || 0,
    isUrlValid: isValidUrl(workshop.registrationLink)
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

      {!showCareerFilter ? (
        <div className="emerge-container py-12">
          <Card className="mb-8 border-emerge-gold/20">
            <CardHeader className="pb-3">
              <CardTitle>Find Your Career Path</CardTitle>
              <CardDescription>
                Tell us what you're interested in, and we'll customize your course recommendations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {careerInterests.slice(1).map(interest => (
                  <button 
                    key={interest.id}
                    className="p-3 border rounded hover:bg-emerge-gold/10 hover:border-emerge-gold flex flex-col items-center gap-2 transition-all"
                    onClick={() => {
                      setActiveCareerInterest(interest.id);
                      setShowCareerFilter(true);
                    }}
                  >
                    <img 
                      src={interest.image}
                      className="w-16 h-16 object-cover rounded-full"
                      alt={interest.name}
                    />
                    <span className="text-sm font-medium">{interest.name}</span>
                  </button>
                ))}
              </div>
              <div className="text-center mt-4">
                <button
                  className="text-sm text-emerge-gold hover:underline"
                  onClick={() => {
                    setActiveCareerInterest("all");
                    setShowCareerFilter(true);
                  }}
                >
                  Skip this step and browse all courses
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="emerge-container py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex overflow-x-auto pb-2 hide-scrollbar">
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
            
            <div className="flex items-center">
              <span className="text-sm mr-2 whitespace-nowrap">Career Filter:</span>
              <select
                className="py-1 px-2 border rounded text-sm"
                value={activeCareerInterest}
                onChange={(e) => setActiveCareerInterest(e.target.value)}
              >
                {careerInterests.map(interest => (
                  <option key={interest.id} value={interest.id}>
                    {interest.name}
                  </option>
                ))}
              </select>
            </div>
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
                  level={course.category_id}
                  description={course.summary || ""}
                  image={course.image_url || "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop"}
                  duration={course.duration || (course.content_type === "course" ? "10-12 weeks" : "1-2 days")}
                  levelName={levels.find(l => l.id === course.category_id)?.name || course.category_id.toUpperCase()}
                  sourceUrl={course.source_url}
                  isUrlValid={isValidUrl(course.source_url)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-emerge-cream p-6 mb-16">
              <p className="text-lg">No courses available for your current filter selection.</p>
              <p className="text-gray-600 mt-2">Try adjusting your filters or check back soon for new content!</p>
              <button 
                onClick={() => {
                  setActiveLevel("all");
                  setActiveCareerInterest("all");
                }}
                className="mt-4 px-4 py-2 bg-emerge-gold text-white rounded hover:bg-emerge-gold/90"
              >
                Reset Filters
              </button>
            </div>
          )}
          
          <UpcomingWorkshops 
            workshops={formattedWorkshops} 
            showAllWorkshops={false} 
          />
          
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
      )}
    </MainLayout>
  );
};

export default Education;
