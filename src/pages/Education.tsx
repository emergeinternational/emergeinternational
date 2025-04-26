
import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { GraduationCap, BookOpen, Library } from "lucide-react";
import CourseCard from "../components/education/CourseCard";
import { staticCourses, Course } from "../data/staticCourses";

const Education = () => {
  const [activeLevel, setActiveLevel] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  
  const levels = [
    { id: "all", name: "ALL" },
    { id: "beginner", name: "BEGINNER" },
    { id: "intermediate", name: "INTERMEDIATE" },
    { id: "advanced", name: "ADVANCED" }
  ];

  const filteredCourses = staticCourses.filter(course => {
    if (activeLevel !== "all" && course.level.toLowerCase() !== activeLevel) {
      return false;
    }
    if (activeCategory !== "all" && course.category.toLowerCase() !== activeCategory) {
      return false;
    }
    return true;
  });

  return (
    <MainLayout>
      <section className="bg-emerge-darkBg text-white py-16">
        <div className="emerge-container">
          <div className="max-w-3xl">
            <h1 className="emerge-heading text-5xl mb-6">Emerge Fashion Academy</h1>
            <p className="text-xl mb-8">
              Discover our comprehensive range of courses designed to develop 
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

      <div className="emerge-container py-12">
        <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Education;
