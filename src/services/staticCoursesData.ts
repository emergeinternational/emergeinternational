
import { Course } from "./courseTypes";

// This function provides static course data when needed
export const getStaticCourses = (): Course[] => {
  return [
    {
      id: "static-course-1",
      title: "Introduction to Fashion Design",
      summary: "Learn the basics of fashion design with this beginner course",
      category: "designer",
      image_url: "/images/courses/fashion-design.jpg",
      is_published: true,
      hosting_type: "hosted"
    },
    {
      id: "static-course-2",
      title: "Professional Model Portfolio",
      summary: "Build your modeling portfolio with professional techniques",
      category: "model",
      image_url: "/images/courses/model-portfolio.jpg",
      is_published: true,
      hosting_type: "hosted"
    },
    {
      id: "static-course-3",
      title: "Fashion Photography Basics",
      summary: "Master the art of fashion photography",
      category: "photographer",
      image_url: "/images/courses/fashion-photography.jpg",
      is_published: true,
      hosting_type: "embedded"
    }
  ];
};
