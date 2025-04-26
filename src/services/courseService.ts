
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
    
    // Map database results to Course interface and ensure unique images
    const usedImages = new Set<string>();
    const courses = data.map(item => {
      // Get a unique image for each course
      const image = getUniqueImageForCourse(item.title, item.category_id, usedImages, item.image_url);
      usedImages.add(image);
      
      return {
        id: item.id,
        title: item.title,
        summary: item.summary || '',
        content_type: item.content_type,
        image_url: image,
        category_id: item.category_id,
        is_featured: item.is_featured,
        published_at: item.published_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        duration: item.content_type === 'course' ? '10-12 weeks' : '1-2 days',
        source_url: isValidUrl(item.source_url) ? item.source_url : undefined,
        // Add career interests
        career_interests: getCourseCareerInterests(item.title, item.category_id)
      };
    });
    
    // Filter courses with invalid source_url
    const validCourses = courses.filter(course => 
      !course.source_url || isValidUrl(course.source_url)
    );
    
    // Apply career interest filter if provided
    if (careerInterest && careerInterest !== 'all') {
      return validCourses.filter(course => 
        course.career_interests?.includes(careerInterest)
      );
    }
    
    return validCourses;
  } catch (error) {
    console.error("Unexpected error in getCourses:", error);
    return [];
  }
};

// Helper function to validate URLs
const isValidUrl = (url?: string): boolean => {
  if (!url) return false;
  
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return url !== 'example.com' && !url.includes('placeholder');
  } catch (e) {
    return false;
  }
};

// Get unique image for course based on title, category, and already used images
const getUniqueImageForCourse = (
  title: string, 
  category: string, 
  usedImages: Set<string>, 
  defaultImage?: string
): string => {
  // If the default image is valid and not already used, use it
  if (defaultImage && 
      defaultImage !== 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop' && 
      !usedImages.has(defaultImage)) {
    return defaultImage;
  }
  
  const titleLower = title.toLowerCase();
  const possibleImages: string[] = [];
  
  // Match course with relevant image based on keywords
  if (titleLower.includes('design') || titleLower.includes('fashion')) {
    possibleImages.push(
      'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558906307-54289c8a9bd4?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1595062584313-44e69e3ef863?w=800&auto=format&fit=crop'
    );
  } 
  
  if (titleLower.includes('model') || titleLower.includes('modeling')) {
    possibleImages.push(
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533561797500-4fad4750814e?w=800&auto=format&fit=crop'
    );
  } 
  
  if (titleLower.includes('photo') || titleLower.includes('photography')) {
    possibleImages.push(
      'https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1452830978618-d6feae7d0ffa?w=800&auto=format&fit=crop'
    );
  } 
  
  if (titleLower.includes('social') || titleLower.includes('marketing')) {
    possibleImages.push(
      'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop'
    );
  } 
  
  if (titleLower.includes('act') || titleLower.includes('perform')) {
    possibleImages.push(
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=800&auto=format&fit=crop'
    );
  }
  
  if (titleLower.includes('video') || titleLower.includes('film')) {
    possibleImages.push(
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1579046399237-23eb585e850b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1492683962492-deef0ec456c0?w=800&auto=format&fit=crop'
    );
  }
  
  if (titleLower.includes('music') || titleLower.includes('audio')) {
    possibleImages.push(
      'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop'
    );
  }
  
  if (titleLower.includes('art') || titleLower.includes('paint')) {
    possibleImages.push(
      'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop'
    );
  }
  
  // Category-based images if no title match or all title matches are used
  if (possibleImages.length === 0 || possibleImages.every(img => usedImages.has(img))) {
    if (category === 'beginner') {
      possibleImages.push(
        'https://images.unsplash.com/photo-1595062584313-44e69e3ef863?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop'
      );
    } else if (category === 'intermediate') {
      possibleImages.push(
        'https://images.unsplash.com/photo-1558906307-54289c8a9bd4?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&auto=format&fit=crop'
      );
    } else if (category === 'advanced') {
      possibleImages.push(
        'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=800&auto=format&fit=crop'
      );
    }
  }
  
  // Additional fallback images
  const fallbackImages = [
    'https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1487865384004-2a1822e63d2d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605816847348-d645e308b252?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524436396230-c4ecc44ddba4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502675135487-e971002a6adb?w=800&auto=format&fit=crop'
  ];
  
  // Add fallbacks if needed
  if (possibleImages.length === 0) {
    possibleImages.push(...fallbackImages);
  }
  
  // Find the first image that hasn't been used
  for (const img of possibleImages) {
    if (!usedImages.has(img)) {
      return img;
    }
  }
  
  // If all possible images are used, create a unique URL with a timestamp
  return `https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop&t=${Date.now()}`;
};

// Get mock career interests for courses with expanded options
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
  
  if (titleLower.includes('photo') || titleLower.includes('camera') || titleLower.includes('photography')) {
    interests.push('photographer');
  }
  
  if (titleLower.includes('video') || titleLower.includes('film') || titleLower.includes('cinematography')) {
    interests.push('videographer');
  }
  
  if (titleLower.includes('music') || titleLower.includes('audio') || titleLower.includes('sound')) {
    interests.push('musical artist');
  }
  
  if (titleLower.includes('paint') || titleLower.includes('art') || titleLower.includes('drawing')) {
    interests.push('fine artist');
  }
  
  // Ensure each course has at least one interest
  if (interests.length === 0) {
    // Assign based on category as fallback
    if (category === 'beginner') {
      interests.push('designer', 'model');
    } else if (category === 'intermediate') {
      interests.push('photographer', 'videographer');
    } else if (category === 'advanced') {
      interests.push('musical artist', 'fine artist');
    } else {
      interests.push('designer', 'model'); // Default
    }
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
        // Validate source_url if present
        if (data.source_url && !isValidUrl(data.source_url)) {
          data.source_url = undefined;
        }
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
      // Validate source_url if present
      if (course.source_url && !isValidUrl(course.source_url)) {
        course.source_url = undefined;
      }
      
      // Get a unique image for this course
      const uniqueImage = getUniqueImageForCourse(course.title, course.category_id, new Set(), course.image_url);
      
      return {
        ...course,
        image_url: uniqueImage,
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
    image_url: getUniqueImageForCourse(data.title, data.category_id, new Set(), data.image_url),
    category_id: data.category_id,
    is_featured: data.is_featured,
    published_at: data.published_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    duration: data.content_type === 'course' ? '10-12 weeks' : '1-2 days',
    source_url: isValidUrl(data.source_url) ? data.source_url : undefined,
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
  const existingCourses = [
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
      career_interests: ["designer"],
      source_url: "https://www.coursera.org/learn/fashion-design"
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
      career_interests: ["designer", "social media influencer"],
      source_url: "https://www.edx.org/learn/fashion-marketing"
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
      career_interests: ["designer"],
      source_url: "https://www.masterclass.com/classes/fashion-design"
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
      career_interests: ["designer", "model"],
      source_url: "https://www.futurelearn.com/courses/sustainable-fashion"
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
      career_interests: ["designer", "model", "actor"],
      source_url: "https://www.skillshare.com/classes/fashion-portfolio"
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
      career_interests: ["model", "actor"],
      source_url: "https://www.youtube.com/watch?v=modelacting"
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
      career_interests: ["social media influencer", "model"],
      source_url: "https://www.udemy.com/course/fashion-influencer"
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
      career_interests: ["entertainment talent", "actor"],
      source_url: "https://www.creativelive.com/entertainment-career"
    }
  ];

  const newCourses = [
    {
      id: "9",
      category_id: "beginner",
      title: "Photography Fundamentals",
      summary: "Master the basics of photography, from camera settings to composition techniques.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["photographer"],
      source_url: "https://www.nikonschool.com/en/photography-courses/beginner"
    },
    {
      id: "10",
      category_id: "intermediate",
      title: "Professional Videography",
      summary: "Learn advanced video production techniques, from pre to post-production.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["videographer"],
      source_url: "https://www.lynda.com/videography-courses"
    },
    {
      id: "11",
      category_id: "beginner",
      title: "Music Production Essentials",
      summary: "Start your journey in music production with fundamental concepts and techniques.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["musical artist"],
      source_url: "https://www.berklee.edu/courses/music-production"
    },
    {
      id: "12",
      category_id: "intermediate",
      title: "Digital Art and Painting",
      summary: "Explore digital art tools and techniques for creating professional artwork.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["fine artist"],
      source_url: "https://www.domestika.org/en/courses/illustration"
    },
    {
      id: "13",
      category_id: "advanced",
      title: "Fashion Photography Masterclass",
      summary: "Learn professional fashion photography techniques from industry experts.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1452830978618-d6feae7d0ffa?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["photographer", "designer"],
      source_url: "https://www.kelbyone.com/fashion-photography"
    },
    {
      id: "14",
      category_id: "intermediate",
      title: "Documentary Filmmaking",
      summary: "Create compelling visual stories through documentary film production.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1579046399237-23eb585e850b?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["videographer"],
      source_url: "https://www.nyfa.edu/documentary-filmmaking"
    },
    {
      id: "15",
      category_id: "advanced",
      title: "Songwriting and Composition",
      summary: "Develop your skills in writing memorable melodies and compelling lyrics.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["musical artist"],
      source_url: "https://www.coursera.org/learn/songwriting"
    },
    {
      id: "16",
      category_id: "beginner",
      title: "Watercolor Techniques",
      summary: "Master the fundamentals of watercolor painting from basic washes to advanced effects.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["fine artist"],
      source_url: "https://www.artistnetwork.com/watercolor-courses"
    }
  ];

  return [...existingCourses, ...newCourses];
};
