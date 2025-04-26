
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Sliders } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryFilter } from "@/components/education/CategoryFilter";
import { LevelFilter } from "@/components/education/LevelFilter";
import { LanguageFilter } from "@/components/education/LanguageFilter";
import { InterestsFilter } from "@/components/education/InterestsFilter";
import { CourseCard } from "@/components/education/CourseCard";
import { EmptyCourseState } from "@/components/education/EmptyCourseState";
import { LearningDashboard } from "@/components/education/LearningDashboard";
import { getCourseCategories, getCourses, enrollInCourse, getUserEnrollments } from "@/services/courseService";
import type { EducationLevel, Language } from "@/types/education";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function Education() {
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('en');
  const [selectedInterest, setSelectedInterest] = useState<string>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const { toast } = useToast();
  const { user } = useAuth();

  const categories = useQuery({
    queryKey: ["courseCategories"],
    queryFn: getCourseCategories
  });

  const courses = useQuery({
    queryKey: ["courses", selectedCategory, selectedLevel, selectedLanguage, searchQuery],
    queryFn: () => getCourses(selectedCategory, selectedLevel, selectedLanguage, searchQuery)
  });

  const enrollments = useQuery({
    queryKey: ["userEnrollments"],
    queryFn: getUserEnrollments,
    enabled: !!user
  });

  // Map enrollments to course IDs for progress tracking
  const courseProgress = enrollments.data?.reduce((acc, enrollment) => {
    acc[enrollment.courseId] = enrollment.progressPercent;
    return acc;
  }, {} as Record<string, number>) || {};

  const handleEnroll = async (courseId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in courses.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await enrollInCourse(courseId);
      await enrollments.refetch();
      
      toast({
        title: "Enrolled Successfully",
        description: "You can now start learning this course."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enroll in the course. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory(undefined);
    setSelectedLevel(undefined);
    setSelectedInterest(undefined);
    setSearchQuery("");
  };

  return (
    <MainLayout>
      <section className="bg-emerge-darkBg text-white py-16">
        <div className="emerge-container">
          <div className="max-w-3xl">
            <h1 className="emerge-heading text-5xl mb-6">Emerge Fashion Academy</h1>
            <p className="text-xl mb-8">
              Discover our comprehensive range of free courses designed to develop 
              the next generation of African fashion talent. From beginner to advanced levels, 
              learn from industry experts and build your future in fashion.
            </p>
            
            {user && (
              <div className="flex gap-4">
                <Button
                  variant={activeTab === "browse" ? "default" : "outline"}
                  onClick={() => setActiveTab("browse")}
                >
                  Browse Courses
                </Button>
                <Button
                  variant={activeTab === "dashboard" ? "default" : "outline"}
                  onClick={() => setActiveTab("dashboard")}
                >
                  My Learning
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="emerge-container py-12">
        {activeTab === "browse" ? (
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex gap-2 items-center md:hidden">
                    <Sliders className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[340px] bg-emerge-darkBg border-gray-800 text-white">
                  <div className="space-y-6 py-6">
                    {categories.data && (
                      <CategoryFilter
                        categories={categories.data}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                      />
                    )}
                    <LevelFilter
                      selectedLevel={selectedLevel}
                      onSelectLevel={setSelectedLevel}
                    />
                    <LanguageFilter
                      selectedLanguage={selectedLanguage}
                      onSelectLanguage={setSelectedLanguage}
                    />
                    <InterestsFilter 
                      selectedInterest={selectedInterest}
                      onSelectInterest={setSelectedInterest}
                    />
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="hidden md:block space-y-8">
                {categories.data && (
                  <CategoryFilter
                    categories={categories.data}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                )}
                <LevelFilter
                  selectedLevel={selectedLevel}
                  onSelectLevel={setSelectedLevel}
                />
                <LanguageFilter
                  selectedLanguage={selectedLanguage}
                  onSelectLanguage={setSelectedLanguage}
                />
                <InterestsFilter 
                  selectedInterest={selectedInterest}
                  onSelectInterest={setSelectedInterest}
                />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </Button>
              </div>
              
              <div className="lg:col-span-3">
                {courses.isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-800 aspect-video rounded-t-lg"></div>
                        <div className="bg-gray-800/50 p-4 rounded-b-lg space-y-2">
                          <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                          <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-700 rounded w-full"></div>
                          <div className="h-10 bg-gray-700 rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : courses.data?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.data.map((course) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        onEnroll={handleEnroll}
                        userProgress={courseProgress[course.id]}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyCourseState onClearFilters={clearAllFilters} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <LearningDashboard />
        )}
      </div>
    </MainLayout>
  );
}
