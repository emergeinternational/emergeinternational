
import React, { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CourseCard from "@/components/education/CourseCard";
import { loadCourses, SimpleCourse } from "@/services/education/simpleCourseService";

// Define talent types for filtering
const TALENT_TYPES = [
  { id: "model", name: "Model" },
  { id: "designer", name: "Designer" },
  { id: "photographer", name: "Photographer" },
  { id: "business", name: "Business" }
];

const Education = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<SimpleCourse[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<SimpleCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const allCourses = await loadCourses();
        setCourses(allCourses);
        setFilteredCourses(allCourses);
      } catch (error) {
        console.error("Error loading courses:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let results = courses;

    // Filter by talent type if not "all"
    if (activeTab !== "all") {
      results = results.filter(course => course.talent_type === activeTab);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(
        course =>
          course.title.toLowerCase().includes(term) ||
          (course.description && course.description.toLowerCase().includes(term))
      );
    }

    setFilteredCourses(results);
  }, [activeTab, searchTerm, courses]);

  return (
    <MainLayout>
      <div className="emerge-container py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="emerge-heading text-4xl mb-8">Education Center</h1>
          <p className="text-lg text-gray-600 mb-12">
            Expand your skills and knowledge with our curated collection of courses
            for emerging fashion professionals. Browse by category or search for
            specific topics.
          </p>

          {/* Search and Filter */}
          <div className="mb-8">
            <Input
              type="search"
              placeholder="Search courses..."
              className="max-w-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tabs for talent types */}
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="mb-8 border-b w-full justify-start rounded-none bg-transparent p-0">
              <TabsTrigger
                value="all"
                className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-emerge-gold data-[state=active]:bg-transparent"
              >
                All Courses
              </TabsTrigger>
              {TALENT_TYPES.map((type) => (
                <TabsTrigger
                  key={type.id}
                  value={type.id}
                  className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-emerge-gold data-[state=active]:bg-transparent"
                >
                  {type.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Course Content */}
            <TabsContent value={activeTab} className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-pulse text-emerge-gold">Loading courses...</div>
                </div>
              ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
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
                  <p className="text-lg">No courses found matching your criteria.</p>
                  <p className="text-gray-600 mt-2">Try adjusting your filters or search term.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Education;
