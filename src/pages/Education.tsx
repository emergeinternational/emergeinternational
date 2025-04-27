
import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { GraduationCap, BookOpen, Library } from "lucide-react";
import { Course, getCourses } from "@/services/courseService";
import { CourseCard } from "@/components/education/CourseCard";
import { useToast } from "@/hooks/use-toast";

const careerPaths = [
  { id: "all", name: "ALL CAREERS" },
  { id: "model", name: "MODEL" },
  { id: "designer", name: "DESIGNER" },
  { id: "photographer", name: "PHOTOGRAPHER" },
  { id: "videographer", name: "VIDEOGRAPHER" },
  { id: "musical_artist", name: "MUSICAL ARTIST" },
  { id: "fine_artist", name: "FINE ARTIST" },
  { id: "event_planner", name: "EVENT PLANNER" }
];

const levels = [
  { id: "all", name: "ALL LEVELS" },
  { id: "beginner", name: "BEGINNER" },
  { id: "intermediate", name: "INTERMEDIATE" },
  { id: "expert", name: "EXPERT" }
];

const Education = () => {
  const [activeLevel, setActiveLevel] = useState("all");
  const [activeCareerPath, setActiveCareerPath] = useState("all");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true);
      try {
        const coursesData = await getCourses(
          activeLevel === "all" ? undefined : activeLevel,
          activeCareerPath === "all" ? undefined : activeCareerPath
        );
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [activeLevel, activeCareerPath, toast]);

  return (
    <MainLayout>
      <section className="bg-emerge-darkBg text-white py-16">
        <div className="emerge-container">
          <div className="max-w-3xl">
            <h1 className="emerge-heading text-5xl mb-6">Emerge Fashion Academy</h1>
            <p className="text-xl mb-8">
              Discover our diverse range of courses designed to develop the next generation of creative talent. 
              Whether you're a beginner or advancing your career, learn from industry leaders and build your future.
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex overflow-x-auto pb-2 hide-scrollbar">
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
            <span className="text-sm mr-2 whitespace-nowrap">Career Path:</span>
            <select
              className="py-1 px-2 border rounded text-sm"
              value={activeCareerPath}
              onChange={(e) => setActiveCareerPath(e.target.value)}
            >
              {careerPaths.map(path => (
                <option key={path.id} value={path.id}>
                  {path.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-emerge-cream p-6">
            <p className="text-lg">No courses available for the selected filters.</p>
            <p className="text-gray-600 mt-2">Try adjusting your filters or check back soon for new content!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Education;
