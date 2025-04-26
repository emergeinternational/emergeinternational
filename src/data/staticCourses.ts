
export type Course = {
  id: string;
  title: string;
  summary: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Model' | 'Designer' | 'Actor' | 'Photographer' | 'Videographer' | 'Musical Artist' | 'Fine Artist' | 'Social Media Influencer' | 'Entertainment Talent';
  video_embed_url: string;
  image_url: string;
  created_at: string;
  updated_at: string;
};

export const staticCourses: Course[] = [
  {
    id: "fashion-design-101",
    title: "Fashion Design Fundamentals",
    summary: "Learn the basics of fashion design including sketching, pattern making, and garment construction.",
    level: "Beginner",
    category: "Designer",
    video_embed_url: "https://www.youtube.com/embed/videoseries?list=PLjHFU8UBjlNu5XLSJ3oiJYQKurFnhTg9S",
    image_url: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z"
  },
  {
    id: "fashion-photography-advanced",
    title: "Advanced Fashion Photography",
    summary: "Master professional lighting, composition, and post-processing techniques for fashion photography.",
    level: "Advanced",
    category: "Photographer",
    video_embed_url: "https://www.youtube.com/embed/videoseries?list=PLjWd5gFyz2O6wbPTgtYFnMrjK3JjwCFvY",
    image_url: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&auto=format&fit=crop",
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z"
  },
  {
    id: "runway-model-101",
    title: "Runway Modeling Essentials",
    summary: "Learn professional runway walking techniques, posing, and presentation skills.",
    level: "Beginner",
    category: "Model",
    video_embed_url: "https://www.youtube.com/embed/videoseries?list=PLjeFjdH56A9rN_R1WopU4TDYRhq3JwMJy",
    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
    created_at: "2025-01-03T00:00:00Z",
    updated_at: "2025-01-03T00:00:00Z"
  },
  {
    id: "digital-content-creation",
    title: "Digital Content Creation for Fashion",
    summary: "Create engaging social media content for fashion brands and personal branding.",
    level: "Intermediate",
    category: "Social Media Influencer",
    video_embed_url: "https://www.youtube.com/embed/videoseries?list=PLjHFU8UBjlNu5XLSJ3oiJYQKurFnhTg9S",
    image_url: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&auto=format&fit=crop",
    created_at: "2025-01-04T00:00:00Z",
    updated_at: "2025-01-04T00:00:00Z"
  }
];
