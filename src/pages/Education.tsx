import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { GraduationCap, BookOpen, Library } from "lucide-react";
import CourseCard from "../components/education/CourseCard";
import UpcomingWorkshops from "../components/education/UpcomingWorkshops";

const Education = () => {
  const [activeLevel, setActiveLevel] = useState("all");
  
  const levels = [
    { id: "beginner", name: "BEGINNER" },
    { id: "intermediate", name: "INTERMEDIATE" },
    { id: "advanced", name: "ADVANCED" },
    { id: "workshop", name: "WORKSHOPS" },
  ];
  
  const courses = [
    { 
      id: 1, 
      name: "Fashion Design 101", 
      level: "beginner",
      duration: "12 weeks",
      description: "Master the fundamentals of fashion design through hands-on projects. Learn sketching, pattern making, and create your first collection.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop"
    },
    { 
      id: 2, 
      name: "Digital Fashion Marketing", 
      level: "beginner",
      duration: "8 weeks",
      description: "Learn to market fashion products effectively using social media, email marketing, and digital advertising strategies.",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop"
    },
    { 
      id: 3, 
      name: "Advanced Pattern Making", 
      level: "advanced",
      duration: "16 weeks",
      description: "Master complex pattern making techniques for haute couture and ready-to-wear collections. Includes draping and 3D modeling.",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop"
    },
    { 
      id: 4, 
      name: "Sustainable Fashion", 
      level: "intermediate",
      duration: "10 weeks",
      description: "Learn eco-friendly design practices, sustainable materials sourcing, and ethical production methods for conscious fashion.",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop"
    },
    { 
      id: 5, 
      name: "Fashion Portfolio", 
      level: "intermediate",
      duration: "6 weeks",
      description: "Create a professional portfolio showcasing your designs. Learn photography, styling, and digital presentation techniques.",
      image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&auto=format&fit=crop"
    },
    { 
      id: 6, 
      name: "Innovation Workshop", 
      level: "workshop",
      duration: "2 days",
      description: "Explore cutting-edge textile techniques and innovative materials in this intensive hands-on workshop.",
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop"
    },
  ];

  const filteredCourses = activeLevel === "all" 
    ? courses 
    : courses.filter(course => course.level === activeLevel);
    
  const upcomingWorkshops = [
    { 
      id: 1, 
      name: "Sustainable Dyeing Techniques", 
      date: "June 15-16, 2025", 
      location: "Addis Ababa",
      spots: 5
    },
    { 
      id: 2, 
      name: "Fashion Photography Masterclass", 
      date: "July 8, 2025", 
      location: "Online",
      spots: 15
    },
    { 
      id: 3, 
      name: "Pattern Making Workshop", 
      date: "August 22-23, 2025", 
      location: "Dire Dawa",
      spots: 8
    },
  ];

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              {...course}
              levelName={levels.find(l => l.id === course.level)?.name || course.level}
            />
          ))}
        </div>
        
        <UpcomingWorkshops workshops={upcomingWorkshops} />
        
        <section>
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
