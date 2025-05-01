
import { Course } from "./courseTypes";

// Static course data for development and fallback
export const getStaticCourses = (): Course[] => [
  {
    id: "1",
    title: "Introduction to Fashion Design",
    summary: "Learn the fundamentals of fashion design with this comprehensive introductory course.",
    category: "designer",
    level: "beginner",
    image_url: "https://images.unsplash.com/photo-1558906476-f4758bdd7baa?w=800&auto=format&fit=crop",
    hosting_type: "hosted",
    is_published: true,
    duration: "8 weeks",
    career_interests: ["designer", "model"],
    source_url: "https://example.com/fashion-design"
  },
  {
    id: "2",
    title: "Advanced Runway Techniques",
    summary: "Master the art of runway walking and presentation with industry professionals.",
    category: "model",
    level: "advanced",
    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
    hosting_type: "hosted",
    is_published: true,
    duration: "4 weeks",
    career_interests: ["model"],
    source_url: "https://example.com/runway-techniques"
  },
  {
    id: "3",
    title: "Fashion Photography Essentials",
    summary: "Learn how to capture stunning fashion photos from setup to post-processing.",
    category: "photographer",
    level: "intermediate",
    image_url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&auto=format&fit=crop",
    hosting_type: "hosted",
    is_published: true,
    duration: "6 weeks",
    career_interests: ["photographer", "model"],
    source_url: "https://example.com/fashion-photography"
  },
  {
    id: "4",
    title: "Event Planning for Fashion Shows",
    summary: "Everything you need to know about planning and executing successful fashion events.",
    category: "event_planner",
    level: "intermediate",
    image_url: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=800&auto=format&fit=crop",
    hosting_type: "hosted",
    is_published: true,
    duration: "10 weeks",
    career_interests: ["event_planner", "designer"],
    source_url: "https://example.com/fashion-events"
  },
];
