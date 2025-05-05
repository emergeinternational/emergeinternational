
import { Course } from "../courseTypes";

export const staticCourses: Course[] = [
  {
    id: "1",
    title: "Fashion Design Fundamentals",
    summary: "Learn the basics of fashion design including sketching, pattern making, and fabric selection.",
    category: "designer",
    level: "beginner",
    duration: "4 weeks",
    image_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
    source_url: "https://example.com/courses/fashion-design-fundamentals",
    content_type: "video",
    career_interests: ["fashion designer", "stylist"],
    hosting_type: "hosted",
    is_published: true
  },
  {
    id: "2",
    title: "Advanced Fashion Collection Development",
    summary: "Create your own fashion collection from concept to showcase, focusing on advanced design techniques.",
    category: "designer",
    level: "expert",
    duration: "12 weeks",
    image_url: "https://images.unsplash.com/photo-1554342872-034a06541bad",
    image: "https://images.unsplash.com/photo-1554342872-034a06541bad",
    source_url: "https://example.com/courses/advanced-fashion-collection",
    content_type: "interactive",
    career_interests: ["fashion designer", "creative director"],
    hosting_type: "hosted",
    is_published: true
  },
  {
    id: "3",
    title: "Fashion Photography Basics",
    summary: "Learn composition, lighting, and styling techniques for fashion photography.",
    category: "photographer",
    level: "beginner",
    duration: "6 weeks",
    image_url: "https://images.unsplash.com/photo-1594387303431-35d313a95018",
    image: "https://images.unsplash.com/photo-1594387303431-35d313a95018",
    source_url: "https://example.com/courses/fashion-photography-basics",
    content_type: "video",
    career_interests: ["fashion photographer", "content creator"],
    hosting_type: "hosted",
    is_published: true
  },
  {
    id: "4",
    title: "Runway Modeling Techniques",
    summary: "Master the art of runway walking, posing, and professional modeling techniques.",
    category: "model",
    level: "beginner",
    duration: "4 weeks",
    image_url: "https://images.unsplash.com/photo-1506634064465-7dab4de896ed",
    image: "https://images.unsplash.com/photo-1506634064465-7dab4de896ed",
    source_url: "https://example.com/courses/runway-modeling-techniques",
    content_type: "video",
    career_interests: ["model", "influencer"],
    hosting_type: "hosted",
    is_published: true
  },
  {
    id: "5",
    title: "Fashion Film Production",
    summary: "Learn to create engaging fashion films, from storyboarding to final editing.",
    category: "videographer",
    level: "intermediate",
    duration: "8 weeks",
    image_url: "https://images.unsplash.com/photo-1540655037529-dec987208707",
    image: "https://images.unsplash.com/photo-1540655037529-dec987208707",
    source_url: "https://example.com/courses/fashion-film-production",
    content_type: "interactive",
    career_interests: ["videographer", "content creator"],
    hosting_type: "hosted",
    is_published: true
  }
];

export const getStaticCourses = (): Course[] => {
  return staticCourses;
};
