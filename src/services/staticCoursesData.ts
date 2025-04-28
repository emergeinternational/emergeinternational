import { Course } from './courseTypes';

export const getStaticCourses = (): Course[] => {
  return [
    {
      id: "1",
      title: "Fashion Design Fundamentals",
      summary: "Learn the basics of fashion design",
      category: 'designer',
      level: 'beginner',
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-design",
      content_type: "course",
      career_interests: ["designer"],
      hosting_type: 'hosted'
    },
    {
      id: "2",
      title: "Advanced Pattern Making",
      summary: "Master the art of pattern making",
      category: "designer",
      level: "expert",
      duration: "12 weeks",
      image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/pattern-making",
      content_type: "course",
      career_interests: ["designer"],
      hosting_type: "hosted"
    },
    {
      id: "3",
      title: "Fashion Photography Basics",
      summary: "Learn how to capture fashion photography",
      category: "photographer",
      level: "beginner",
      duration: "6 weeks",
      image_url: "https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-photography",
      content_type: "course",
      career_interests: ["photographer"],
      hosting_type: "hosted"
    },
    {
      id: "4",
      title: "Runway Walk Techniques",
      summary: "Perfect your runway walk for fashion shows",
      category: "model",
      level: "beginner",
      duration: "4 weeks",
      image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/runway-walk",
      content_type: "course",
      career_interests: ["model"],
      hosting_type: "hosted"
    },
    {
      id: "5",
      title: "Video Production for Fashion",
      summary: "Create professional fashion videos",
      category: "videographer",
      level: "intermediate",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/video-production",
      content_type: "course",
      career_interests: ["videographer"],
      hosting_type: "hosted"
    },
    {
      id: "6",
      title: "Songwriting for Fashion Shows",
      summary: "Create compelling music for runway shows",
      category: "musical_artist",
      level: "intermediate",
      duration: "6 weeks",
      image_url: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-music",
      content_type: "course",
      career_interests: ["musical_artist"],
      hosting_type: "hosted"
    },
    {
      id: "7",
      title: "Fashion Illustration Techniques",
      summary: "Master drawing and painting fashion illustrations",
      category: "fine_artist",
      level: "beginner",
      duration: "10 weeks",
      image_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-illustration",
      content_type: "course",
      career_interests: ["fine_artist"],
      hosting_type: "hosted"
    },
    {
      id: "8",
      title: "Fashion Show Planning",
      summary: "Learn to plan and execute successful fashion events",
      category: "event_planner",
      level: "expert",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-show-planning",
      content_type: "course",
      career_interests: ["event_planner"],
      hosting_type: "hosted"
    }
  ];
};
