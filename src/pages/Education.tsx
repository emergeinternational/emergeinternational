
import { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { ChevronRight } from "lucide-react";

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
      description: "Learn the fundamentals of fashion design, from sketching to creating your first piece.",
      image: "/placeholder.svg" 
    },
    { 
      id: 2, 
      name: "Fashion Marketing Basics", 
      level: "beginner",
      description: "Understand how to market fashion products and build a brand in the digital age.",
      image: "/placeholder.svg" 
    },
    { 
      id: 3, 
      name: "Advanced Pattern Making", 
      level: "advanced",
      description: "Master complex pattern making techniques for high-fashion garments.",
      image: "/placeholder.svg" 
    },
    { 
      id: 4, 
      name: "Sustainable Fashion Practices", 
      level: "intermediate",
      description: "Learn how to incorporate sustainability into your fashion business and designs.",
      image: "/placeholder.svg" 
    },
    { 
      id: 5, 
      name: "Digital Fashion Portfolio", 
      level: "intermediate",
      description: "Create a professional digital portfolio to showcase your designs to potential clients.",
      image: "/placeholder.svg" 
    },
    { 
      id: 6, 
      name: "Textile Innovation Workshop", 
      level: "workshop",
      description: "A hands-on workshop exploring innovative textile techniques and materials.",
      image: "/placeholder.svg" 
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
      location: "Addis Ababa"
    },
    { 
      id: 2, 
      name: "Fashion Photography Masterclass", 
      date: "July 8, 2025", 
      location: "Online"
    },
    { 
      id: 3, 
      name: "Pattern Making Workshop", 
      date: "August 22-23, 2025", 
      location: "Dire Dawa"
    },
  ];

  return (
    <MainLayout>
      <section className="bg-emerge-darkBg text-white py-12">
        <div className="emerge-container">
          <h1 className="emerge-heading text-4xl mb-4">Education</h1>
          <p className="max-w-2xl text-lg">
            Discover our range of courses and workshops designed to develop the next generation 
            of African fashion talent.
          </p>
        </div>
      </section>

      <div className="emerge-container py-8">
        {/* Level Filter */}
        <div className="mb-8 flex overflow-x-auto pb-2 hide-scrollbar">
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
        
        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredCourses.map(course => (
            <Link 
              to={`/education/course/${course.id}`} 
              key={course.id} 
              className="bg-white group shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
            >
              <div className="aspect-video overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <span className="text-xs text-gray-500 uppercase mb-1">
                  {levels.find(l => l.id === course.level)?.name || course.level}
                </span>
                <h3 className="font-medium text-lg mb-2">{course.name}</h3>
                <p className="text-gray-600 text-sm flex-grow">
                  {course.description}
                </p>
                <div className="mt-4">
                  <span className="text-emerge-gold group-hover:underline flex items-center">
                    Learn More <ChevronRight size={16} className="ml-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Upcoming Workshops */}
        <section className="mb-12">
          <h2 className="emerge-heading text-2xl mb-6">Upcoming Workshops</h2>
          <div className="bg-emerge-cream p-6">
            <div className="space-y-4">
              {upcomingWorkshops.map(workshop => (
                <div key={workshop.id} className="flex justify-between items-center p-3 bg-white">
                  <div>
                    <h3 className="font-medium">{workshop.name}</h3>
                    <p className="text-gray-600 text-sm">
                      {workshop.date} • {workshop.location}
                    </p>
                  </div>
                  <Link 
                    to={`/education/workshop/${workshop.id}`}
                    className="bg-emerge-gold px-4 py-1 text-sm"
                  >
                    Register
                  </Link>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link to="/education/workshops" className="emerge-button-primary">
                View All Workshops
              </Link>
            </div>
          </div>
        </section>
        
        {/* Certifications */}
        <section>
          <h2 className="emerge-heading text-2xl mb-6">Internationally Certified Courses</h2>
          <div className="bg-white border p-6 max-w-3xl">
            <p className="mb-4">
              Our fashion education programs are certified by international fashion 
              institutions, ensuring that your learning meets global industry standards.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500">Certification Logo</span>
              </div>
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500">Certification Logo</span>
              </div>
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500">Certification Logo</span>
              </div>
              <div className="aspect-square bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500">Certification Logo</span>
              </div>
            </div>
            <Link to="/education/certifications" className="text-emerge-gold hover:underline flex items-center">
              Learn more about our certifications <ChevronRight size={16} className="ml-1" />
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Education;
