
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import MainLayout from "@/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "@/components/education/CategoryFilter";
import { LevelFilter } from "@/components/education/LevelFilter";
import { CourseCard } from "@/components/education/CourseCard";
import { getCourseCategories, getCourses, enrollInCourse } from "@/services/courseService";
import type { EducationLevel } from "@/types/education";
import { useToast } from "@/components/ui/use-toast";

export default function Education() {
  const [selectedCategory, setSelectedCategory] = useState<string>();
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel>();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const categories = useQuery({
    queryKey: ["courseCategories"],
    queryFn: getCourseCategories
  });

  const courses = useQuery({
    queryKey: ["courses", selectedCategory, selectedLevel, searchQuery],
    queryFn: () => getCourses(selectedCategory, selectedLevel, searchQuery)
  });

  const handleEnroll = async (courseId: string) => {
    try {
      await enrollInCourse(courseId);
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
          </div>
        </div>
      </section>

      <div className="emerge-container py-12">
        <div className="flex flex-col space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search courses..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

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

          {courses.isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-emerge-gold">Loading courses...</div>
            </div>
          ) : courses.data?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.data.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEnroll={handleEnroll}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-emerge-cream p-6">
              <p className="text-lg">No courses found matching your criteria.</p>
              <p className="text-gray-600 mt-2">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
