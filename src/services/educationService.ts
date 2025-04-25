
import { supabase } from "@/integrations/supabase/client";

// Define our interfaces for education data
export interface EducationCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EducationContent {
  id: string;
  category_id: string;
  title: string;
  summary?: string;
  content_type: string;
  source_url?: string;
  image_url?: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
  archive_date?: string;
  talent_type?: string;
  level?: string;
}

// Add new interfaces for course progress and engagement
export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  course_category: string | null;
  date_started: string;
  date_completed: string | null;
  status: 'started' | 'completed';
}

export interface CourseEngagement {
  id: string;
  course_id: string;
  total_clicks: number;
  last_click_date: string;
}

// Define talent types
export const TALENT_TYPES = [
  'models',
  'designers',
  'photographers',
  'videographers',
  'influencers',
  'entertainment'
] as const;

// Define talent type as a union of string literals
export type TalentType = typeof TALENT_TYPES[number];

// Static fallback data for categories
const fallbackCategories: EducationCategory[] = [
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
const fallbackContent: EducationContent[] = [
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

/**
 * Gets education categories with fallback to static data
 */
export const getEducationCategories = async (): Promise<EducationCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('education_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching education categories:", error);
      return fallbackCategories;
    }

    return data || fallbackCategories;
  } catch (error) {
    console.error("Unexpected error in getEducationCategories:", error);
    return fallbackCategories;
  }
};

/**
 * Gets education content with talent type filtering
 */
export const getEducationContent = async (
  categoryId?: string,
  limit: number = 50, 
  featuredOnly: boolean = false,
  talentType?: string
): Promise<EducationContent[]> => {
  try {
    console.log(`Fetching education content. CategoryID: ${categoryId || 'all'}, Talent Type: ${talentType || 'all'}, Limit: ${limit}`);
    
    let query = supabase
      .from('education_content')
      .select('*')
      .limit(limit);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    
    if (talentType) {
      query = query.eq('talent_type', talentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching education content:", error);
      const fallbackData = getFallbackContent(categoryId, limit, featuredOnly, talentType);
      console.log(`Using fallback data: ${fallbackData.length} items`);
      return fallbackData;
    }

    if (data && data.length > 0) {
      console.log(`Fetched ${data.length} courses from database`);
      return data;
    } else {
      console.log("No data returned from database, using fallback");
      return getFallbackContent(categoryId, limit, featuredOnly, talentType);
    }
  } catch (error) {
    console.error("Error in getEducationContent:", error);
    return getFallbackContent(categoryId, limit, featuredOnly, talentType);
  }
};

// Helper function to filter fallback content
const getFallbackContent = (
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

/**
 * Groups education content by category
 */
export const getEducationContentByCategory = async (): Promise<Record<string, EducationContent[]>> => {
  try {
    const categories = await getEducationCategories();
    const result: Record<string, EducationContent[]> = {};
    
    for (const category of categories) {
      const content = await getEducationContent(category.id, 5);
      result[category.id] = content;
    }
    
    return result;
  } catch (error) {
    console.error("Error in getEducationContentByCategory:", error);
    
    // Create a fallback response with the static content
    const result: Record<string, EducationContent[]> = {};
    for (const category of fallbackCategories) {
      result[category.id] = fallbackContent
        .filter(item => item.category_id === category.id)
        .slice(0, 5);
    }
    
    return result;
  }
};

export const getEducationContentByTalentType = async (
  limit: number = 5,
  featuredOnly: boolean = false
): Promise<Record<string, EducationContent[]>> => {
  try {
    const result: Record<string, EducationContent[]> = {};
    
    for (const talentType of TALENT_TYPES) {
      const content = await getEducationContent(undefined, limit, featuredOnly, talentType);
      result[talentType] = content;
    }
    
    return result;
  } catch (error) {
    console.error("Error in getEducationContentByTalentType:", error);
    
    // Create a fallback response with the static content
    const result: Record<string, EducationContent[]> = {};
    for (const talentType of TALENT_TYPES) {
      result[talentType] = fallbackContent
        .filter(item => item.talent_type === talentType)
        .slice(0, limit);
    }
    
    return result;
  }
};

export const trackCourseEngagement = async (courseId: string): Promise<void> => {
  try {
    const { data: existingEngagement } = await supabase
      .from('course_engagement')
      .select('*')
      .eq('course_id', courseId)
      .single();

    if (existingEngagement) {
      await supabase
        .from('course_engagement')
        .update({
          total_clicks: existingEngagement.total_clicks + 1,
          last_click_date: new Date().toISOString(),
        })
        .eq('course_id', courseId);
    } else {
      await supabase
        .from('course_engagement')
        .insert({
          course_id: courseId,
          total_clicks: 1,
          last_click_date: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Error tracking course engagement:', error);
  }
};

export const trackCourseProgress = async (courseId: string, category: string): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      console.log('User not authenticated, skipping progress tracking');
      return;
    }
    
    const userId = sessionData.session.user.id;

    const { data: existingProgress } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (!existingProgress) {
      await supabase
        .from('user_course_progress')
        .insert({
          user_id: userId,
          course_id: courseId,
          course_category: category,
          status: 'started',
        });
    }
  } catch (error) {
    console.error('Error tracking course progress:', error);
  }
};

export const markCourseCompleted = async (courseId: string): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      console.log('User not authenticated, cannot mark course complete');
      return;
    }
    
    const userId = sessionData.session.user.id;

    await supabase
      .from('user_course_progress')
      .update({
        status: 'completed',
        date_completed: new Date().toISOString(),
      })
      .eq('course_id', courseId)
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error marking course as completed:', error);
  }
};

export const getCourseWeeklyContent = async (courseId: string) => {
  try {
    return [
      {
        title: "Week 1: Introduction to Design Principles",
        content: "This week covers the fundamentals of design thinking and principles that form the foundation of fashion design."
      },
      {
        title: "Week 2: Creating Mood Boards",
        content: "Learn how to create effective mood boards that communicate your vision and inspiration."
      }
    ];
  } catch (error) {
    console.error('Error getting weekly course content:', error);
    return [];
  }
};
