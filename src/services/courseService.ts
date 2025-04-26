
import { supabase } from "@/integrations/supabase/client";

// Define interfaces based on actual database schema
export interface Course {
  id: string;
  title: string;
  summary?: string;
  content_type: string;
  image_url?: string;
  category_id: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  levelName?: string;
  duration?: string;
  content?: string;
  source_url?: string;
  career_interests?: string[];
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  date_started: string;
  date_completed?: string;
  course_category?: string;
  created_at: string;
  updated_at: string;
}

// Get courses with optional filtering
export const getCourses = async (
  categoryId?: string,
  limit: number = 10,
  featuredOnly: boolean = false,
  careerInterest?: string
): Promise<Course[]> => {
  try {
    let query = supabase
      .from('education_content')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }
    
    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
    
    // Map database results to Course interface
    const courses = data.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary || '',
      content_type: item.content_type,
      image_url: getRelevantCourseImage(item.title, item.category_id, item.image_url),
      category_id: item.category_id,
      is_featured: item.is_featured,
      published_at: item.published_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      duration: item.content_type === 'course' ? '10-12 weeks' : '1-2 days',
      source_url: item.source_url,
      // Add mock career interests for now - would be stored in DB in production
      career_interests: getCourseCareerInterests(item.title, item.category_id)
    }));
    
    // Apply career interest filter if provided
    if (careerInterest && careerInterest !== 'all') {
      return courses.filter(course => 
        course.career_interests?.includes(careerInterest)
      );
    }
    
    return courses;
  } catch (error) {
    console.error("Unexpected error in getCourses:", error);
    return [];
  }
};

// Get relevant image for course based on title and category
const getRelevantCourseImage = (title: string, category: string, defaultImage?: string): string => {
  if (defaultImage && defaultImage !== 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop') {
    return defaultImage;
  }
  
  const titleLower = title.toLowerCase();
  
  // Match course with relevant image based on keywords
  if (titleLower.includes('design') || titleLower.includes('fashion')) {
    return 'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop';
  } else if (titleLower.includes('model') || titleLower.includes('modeling')) {
    return 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop';
  } else if (titleLower.includes('photo') || titleLower.includes('photography')) {
    return 'https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=800&auto=format&fit=crop';
  } else if (titleLower.includes('social') || titleLower.includes('marketing')) {
    return 'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&auto=format&fit=crop';
  } else if (titleLower.includes('act') || titleLower.includes('perform')) {
    return 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop';
  }
  
  // Category-based images if no title match
  if (category === 'beginner') {
    return 'https://images.unsplash.com/photo-1595062584313-44e69e3ef863?w=800&auto=format&fit=crop';
  } else if (category === 'intermediate') {
    return 'https://images.unsplash.com/photo-1558906307-54289c8a9bd4?w=800&auto=format&fit=crop';
  } else if (category === 'advanced') {
    return 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=800&auto=format&fit=crop';
  }
  
  // Default image
  return 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&auto=format&fit=crop';
};

// Get mock career interests for courses
const getCourseCareerInterests = (title: string, category: string): string[] => {
  const titleLower = title.toLowerCase();
  const interests = [];
  
  if (titleLower.includes('design') || titleLower.includes('fashion') || titleLower.includes('pattern')) {
    interests.push('designer');
  }
  
  if (titleLower.includes('model') || titleLower.includes('portfolio') || titleLower.includes('runway')) {
    interests.push('model');
  }
  
  if (titleLower.includes('act') || titleLower.includes('perform') || titleLower.includes('stage')) {
    interests.push('actor');
  }
  
  if (titleLower.includes('social') || titleLower.includes('media') || titleLower.includes('marketing')) {
    interests.push('social media influencer');
  }
  
  if (titleLower.includes('entertainment') || titleLower.includes('talent')) {
    interests.push('entertainment talent');
  }
  
  // Ensure each course has at least one interest
  if (interests.length === 0) {
    interests.push('designer', 'model'); // Default to these two
  }
  
  return interests;
};

// Get featured courses
export const getFeaturedCourses = async (limit: number = 3): Promise<Course[]> => {
  return getCourses(undefined, limit, true);
};

// Get a specific course by ID
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    console.log("Getting course with ID:", courseId);
    
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      console.error("Invalid course ID provided:", courseId);
      return null;
    }
    
    // First try to fetch from database using UUID
    if (isValidUUID(courseId)) {
      const { data, error } = await supabase
        .from('education_content')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) {
        console.error("Error fetching course:", error);
        // Continue to fallback options
      } else if (data) {
        return mapCourseData(data);
      }
    }
    
    // If database fetch fails or invalid UUID, fall back to static courses
    const allCourses = getStaticCourses();
    const course = allCourses.find(c => {
      // Match by ID directly or by its numeric representation
      const numericId = parseInt(courseId);
      return c.id === courseId || (!isNaN(numericId) && parseInt(c.id) === numericId);
    });
    
    if (course) {
      return {
        ...course,
        image_url: getRelevantCourseImage(course.title, course.category_id, course.image_url),
        career_interests: getCourseCareerInterests(course.title, course.category_id)
      };
    }
    
    console.error("Course not found with ID:", courseId);
    return null;
  } catch (error) {
    console.error("Unexpected error in getCourseById:", error);
    return null;
  }
};

// Check if string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Map database result to Course interface
const mapCourseData = (data: any): Course => {
  return {
    id: data.id,
    title: data.title,
    summary: data.summary || '',
    content_type: data.content_type,
    image_url: getRelevantCourseImage(data.title, data.category_id, data.image_url),
    category_id: data.category_id,
    is_featured: data.is_featured,
    published_at: data.published_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    duration: data.content_type === 'course' ? '10-12 weeks' : '1-2 days',
    source_url: data.source_url,
    career_interests: getCourseCareerInterests(data.title, data.category_id)
  };
};

// Get course progress for a user
export const getUserCourseProgress = async (userId: string): Promise<CourseProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching course progress:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error in getUserCourseProgress:", error);
    return [];
  }
};

// Create or update course progress
export const updateCourseProgress = async (
  userId: string,
  courseId: string,
  status: string,
  courseCategory?: string
): Promise<boolean> => {
  try {
    // Check if progress record exists
    const { data: existingData } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (existingData) {
      // Update existing record
      const { error } = await supabase
        .from('user_course_progress')
        .update({
          status,
          updated_at: new Date().toISOString(),
          date_completed: status === 'completed' ? new Date().toISOString() : existingData.date_completed
        })
        .eq('id', existingData.id);
      
      if (error) {
        console.error("Error updating course progress:", error);
        throw error;
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('user_course_progress')
        .insert([{
          user_id: userId,
          course_id: courseId,
          status,
          course_category: courseCategory,
          date_started: new Date().toISOString()
        }]);
      
      if (error) {
        console.error("Error creating course progress:", error);
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error in updateCourseProgress:", error);
    return false;
  }
};

// Get recommended courses based on user interests
export const getRecommendedCourses = async (userId: string, limit: number = 3): Promise<Course[]> => {
  try {
    // For now, just return featured courses as recommendations
    // In future this could be based on user preferences or course history
    return getFeaturedCourses(limit);
  } catch (error) {
    console.error("Unexpected error in getRecommendedCourses:", error);
    return [];
  }
};

// Get static courses as fallback
export const getStaticCourses = (): Course[] => {
  return [
    { 
      id: "1", 
      category_id: "beginner",
      title: "Fashion Design 101", 
      summary: "Master the fundamentals of fashion design through hands-on projects. Learn sketching, pattern making, and create your first collection.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
      is_featured: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["designer"]
    },
    { 
      id: "2", 
      category_id: "beginner",
      title: "Digital Fashion Marketing", 
      summary: "Learn to market fashion products effectively using social media, email marketing, and digital advertising strategies.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["designer", "social media influencer"]
    },
    { 
      id: "3", 
      category_id: "advanced",
      title: "Advanced Pattern Making", 
      summary: "Master complex pattern making techniques for haute couture and ready-to-wear collections. Includes draping and 3D modeling.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1558906307-54289c8a9bd4?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["designer"]
    },
    { 
      id: "4", 
      category_id: "intermediate",
      title: "Sustainable Fashion", 
      summary: "Learn eco-friendly design practices, sustainable materials sourcing, and ethical production methods for conscious fashion.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=800&auto=format&fit=crop",
      is_featured: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["designer", "model"]
    },
    { 
      id: "5", 
      category_id: "intermediate",
      title: "Fashion Portfolio", 
      summary: "Create a professional portfolio showcasing your designs. Learn photography, styling, and digital presentation techniques.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["designer", "model", "actor"]
    },
    { 
      id: "6", 
      category_id: "workshop",
      title: "Acting for Models Workshop", 
      summary: "Improve your camera presence and runway confidence with acting techniques in this intensive hands-on workshop.",
      content_type: "workshop",
      image_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop",
      is_featured: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["model", "actor"]
    },
    {
      id: "7",
      category_id: "beginner",
      title: "Social Media for Fashion Influencers",
      summary: "Learn to build your fashion brand on Instagram, TikTok and other platforms with effective content strategies.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop",
      is_featured: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["social media influencer", "model"]
    },
    {
      id: "8",
      category_id: "intermediate",
      title: "Entertainment Industry Navigation",
      summary: "Discover how to build your career in the entertainment industry, from networking to portfolio development.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["entertainment talent", "actor"]
    }
  ];
};
