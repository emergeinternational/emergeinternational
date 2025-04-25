
import { EducationCategory, EducationContent } from './types';

// Static fallback data for categories
export const fallbackCategories: EducationCategory[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Courses and resources for those new to fashion',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Take your skills to the next level',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Master advanced techniques and concepts',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Hands-on learning experiences',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Enhanced fallback content with talent types
export const fallbackContent: EducationContent[] = [
  // DESIGNERS
  { 
    id: "1", 
    category_id: "beginner",
    talent_type: "designers",
    level: "beginner",
    title: "Fashion Design 101", 
    summary: "Master the fundamentals of fashion design through hands-on projects. Learn sketching, pattern making, and create your first collection.",
    content_type: "course",
    image_url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "4", 
    category_id: "intermediate",
    talent_type: "designers",
    level: "intermediate",
    title: "Sustainable Fashion", 
    summary: "Learn eco-friendly design practices, sustainable materials sourcing, and ethical production methods for conscious fashion.",
    content_type: "course",
    source_url: "https://www.coursera.org/learn/sustainable-fashion",
    image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // MODELS
  { 
    id: "10", 
    category_id: "beginner",
    talent_type: "models",
    level: "beginner",
    title: "Runway Walking Basics", 
    summary: "Master the fundamentals of runway walking techniques, posture, and presentation needed for fashion shows and photo shoots.",
    content_type: "video",
    source_url: "https://www.youtube.com/watch?v=modelwalk101",
    image_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "11", 
    category_id: "intermediate",
    talent_type: "models",
    level: "intermediate",
    title: "Portfolio Development for Models", 
    summary: "Learn to build a professional modeling portfolio that showcases your range and attracts top clients and agencies.",
    content_type: "course",
    source_url: "https://www.modelingclass.com/portfolio",
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // PHOTOGRAPHERS
  { 
    id: "20", 
    category_id: "beginner",
    talent_type: "photographers",
    level: "beginner",
    title: "Fashion Photography Essentials", 
    summary: "Learn the basics of fashion photography including lighting, composition, and directing models for compelling fashion imagery.",
    content_type: "weekly",
    image_url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "21", 
    category_id: "advanced",
    talent_type: "photographers",
    level: "advanced",
    title: "Editorial Fashion Photography", 
    summary: "Master the art of creating compelling fashion narratives for editorial publications with advanced lighting and conceptual techniques.",
    content_type: "video",
    source_url: "https://www.youtube.com/watch?v=editorialphoto",
    image_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&auto=format&fit=crop",
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // VIDEOGRAPHERS
  { 
    id: "30", 
    category_id: "beginner",
    talent_type: "videographers",
    level: "beginner",
    title: "Fashion Film Fundamentals", 
    summary: "Learn the essentials of creating compelling fashion films, from concept development to editing and post-production.",
    content_type: "course",
    image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop",
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "31", 
    category_id: "intermediate",
    talent_type: "videographers",
    level: "intermediate",
    title: "Advanced Fashion Video Editing", 
    summary: "Take your fashion videos to the next level with professional editing techniques, color grading, and visual effects.",
    content_type: "video",
    source_url: "https://www.youtube.com/watch?v=fashionediting",
    image_url: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // INFLUENCERS
  { 
    id: "40", 
    category_id: "beginner",
    talent_type: "influencers",
    level: "beginner",
    title: "Building Your Fashion Brand on Social Media", 
    summary: "Learn strategies to build an authentic fashion brand on social platforms and grow your audience organically.",
    content_type: "weekly",
    image_url: "https://images.unsplash.com/photo-1516251193007-4d28214057c2?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "41", 
    category_id: "advanced",
    talent_type: "influencers",
    level: "advanced",
    title: "Monetizing Your Fashion Influence", 
    summary: "Advanced strategies for fashion influencers to secure brand partnerships, create revenue streams, and build sustainable businesses.",
    content_type: "course",
    source_url: "https://www.influencercourse.com/monetization",
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop",
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  // ENTERTAINMENT TALENT
  { 
    id: "50", 
    category_id: "beginner",
    talent_type: "entertainment",
    level: "beginner",
    title: "Fashion Performance Basics", 
    summary: "Learn the fundamentals of movement, expression, and performance for fashion shows and branded entertainment events.",
    content_type: "video",
    source_url: "https://www.youtube.com/watch?v=fashionperformance",
    image_url: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "51", 
    category_id: "intermediate",
    talent_type: "entertainment",
    level: "intermediate",
    title: "Choreography for Fashion Events", 
    summary: "Develop your skills in choreographing and performing in fashion shows, brand activations, and promotional events.",
    content_type: "weekly",
    image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop",
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

// Helper function to filter fallback content
export const getFallbackContent = (
  categoryId?: string, 
  limit: number = 50, 
  featuredOnly: boolean = false,
  talentType?: string
): EducationContent[] => {
  let filtered = [...fallbackContent];
  
  if (categoryId) {
    filtered = filtered.filter(item => item.category_id === categoryId);
  }
  
  if (featuredOnly) {
    filtered = filtered.filter(item => item.is_featured);
  }
  
  if (talentType) {
    filtered = filtered.filter(item => item.talent_type === talentType);
  }
  
  console.log(`Filtered fallback content: ${filtered.length} items`);
  return filtered.slice(0, limit);
};
