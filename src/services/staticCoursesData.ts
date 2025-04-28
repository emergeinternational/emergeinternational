
import { Course } from "./courseTypes";

export const getStaticCourses = async (): Promise<Course[]> => {
  return [
    {
      id: "static-1",
      title: "Introduction to Modeling",
      summary: "Learn the basics of modeling in the fashion industry",
      description: "This course covers the fundamentals of modeling including posing, runway walking, and portfolio development.",
      category: "model",
      level: "beginner",
      duration: "2 hours",
      image_url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      hosting_type: "hosted",
      is_published: true
    },
    {
      id: "static-2",
      title: "Fashion Design Fundamentals",
      summary: "Master the basics of fashion design",
      description: "Learn about fashion design principles, pattern making, and creating your first collection.",
      category: "designer",
      level: "beginner",
      duration: "4 hours",
      image_url: "https://images.unsplash.com/photo-1558906307-54289c0ceaf4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      hosting_type: "hosted",
      is_published: true
    },
    {
      id: "static-3",
      title: "Fashion Photography Techniques",
      summary: "Capture stunning fashion images",
      description: "Learn professional fashion photography techniques including lighting, composition, and working with models.",
      category: "photographer",
      level: "intermediate",
      duration: "3 hours",
      image_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      hosting_type: "hosted",
      is_published: true
    }
  ];
};
