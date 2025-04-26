
import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  category: string;
  level: string;
  duration?: string;
  instructor?: string;
  image?: string;
  link?: string;
  slug?: string;
  rating?: number;
  reviews?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  prerequisites?: string[];
  created_at?: string;
  updated_at?: string;
  // Add properties that were referenced in other files
  source_url?: string;
  image_url?: string;
  content_type?: string;
  category_id?: string;
  career_interests?: string[];
}

// Add progress property to CourseProgress interface
export interface CourseProgress {
  id: string;
  course_id: string;
  user_id: string;
  status: string;
  course_category: string;
  date_started: string;
  date_completed: string;
  created_at: string;
  updated_at: string;
  progress: number; // This is the property we need to ensure exists
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at?: string;
}

export const calculateCourseCompletion = (progress: number): string => {
  if (progress < 25) {
    return "Beginner";
  } else if (progress < 50) {
    return "Intermediate";
  } else if (progress < 75) {
    return "Advanced";
  } else {
    return "Completed";
  }
};

export const getUserCourseProgress = async (userId?: string): Promise<CourseProgress[]> => {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user course progress:", error);
      return [];
    }

    // Map the data to include progress property if it doesn't exist
    return data.map((item: any): CourseProgress => ({
      ...item,
      progress: item.progress !== undefined ? item.progress : 0 // Ensure progress property exists
    }));
  } catch (error) {
    console.error("Unexpected error in getUserCourseProgress:", error);
    return [];
  }
};

export const updateCourseProgress = async (
  courseId: string,
  userId: string,
  category: string,
  progressValue: number = 0,
  status: string = "in_progress"
): Promise<CourseProgress | null> => {
  try {
    // Check if progress already exists
    const { data: existingProgress } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingProgress) {
      // Update existing progress
      const { data, error } = await supabase
        .from("user_course_progress")
        .update({
          status,
          progress: progressValue, // Use the progress parameter
          date_completed: status === "completed" ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingProgress.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating course progress:", error);
        return null;
      }

      return {
        ...data,
        progress: data.progress !== undefined ? data.progress : progressValue // Ensure progress exists
      } as CourseProgress;
    } else {
      // Create new progress
      const { data, error } = await supabase
        .from("user_course_progress")
        .insert({
          course_id: courseId,
          user_id: userId,
          course_category: category,
          status,
          progress: progressValue,
          date_started: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating course progress:", error);
        return null;
      }

      return {
        ...data,
        progress: data.progress !== undefined ? data.progress : progressValue // Ensure progress exists
      } as CourseProgress;
    }
  } catch (error) {
    console.error("Unexpected error in updateCourseProgress:", error);
    return null;
  }
};

export const getCourseProgress = async (
  courseId: string,
  userId?: string
): Promise<CourseProgress | null> => {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching course progress:", error);
      return null;
    }

    if (!data) return null;

    return {
      ...data,
      progress: data.progress !== undefined ? data.progress : 0 // Ensure progress exists
    } as CourseProgress;
  } catch (error) {
    console.error("Unexpected error in getCourseProgress:", error);
    return null;
  }
};

// Add missing functions that were referenced in other files
export const getEligibleUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("certificate_eligibility")
      .select("*, profiles(*)");

    if (error) {
      console.error("Error fetching eligible users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getEligibleUsers:", error);
    return [];
  }
};

export const updateCertificateApproval = async (
  userId: string,
  approved: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("certificate_eligibility")
      .update({ admin_approved: approved })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating certificate approval:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in updateCertificateApproval:", error);
    return false;
  }
};

export const trackCourseEngagement = async (courseId: string): Promise<boolean> => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from("course_engagement")
      .select("*")
      .eq("course_id", courseId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking course engagement:", fetchError);
      return false;
    }

    if (existing) {
      // Update existing engagement
      const { error } = await supabase
        .from("course_engagement")
        .update({
          total_clicks: (existing.total_clicks || 0) + 1,
          last_click_date: new Date().toISOString()
        })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating course engagement:", error);
        return false;
      }
    } else {
      // Create new engagement
      const { error } = await supabase
        .from("course_engagement")
        .insert({
          course_id: courseId,
          total_clicks: 1,
          last_click_date: new Date().toISOString()
        });

      if (error) {
        console.error("Error creating course engagement:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in trackCourseEngagement:", error);
    return false;
  }
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
    const { data, error } = await supabase
      .from("education_content")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching course by ID:", error);
      return null;
    }

    // Map education_content fields to Course interface
    const course: Course = {
      id: data.id,
      title: data.title,
      summary: data.summary,
      category: data.category_id || '',
      level: data.content_type || '',
      source_url: data.source_url,
      image_url: data.image_url,
      content_type: data.content_type,
      category_id: data.category_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return course;
  } catch (error) {
    console.error("Unexpected error in getCourseById:", error);
    return null;
  }
};

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from("education_content")
      .select("*");

    if (error) {
      console.error("Error fetching all courses:", error);
      return [];
    }

    // Map education_content fields to Course interface
    return data.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category_id || '',
      level: item.content_type || '',
      source_url: item.source_url,
      image_url: item.image_url,
      content_type: item.content_type,
      category_id: item.category_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      career_interests: []
    }));
  } catch (error) {
    console.error("Unexpected error in getAllCourses:", error);
    return [];
  }
};

export const getPopularCourses = async (): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from("education_content")
      .select("*")
      .eq("is_featured", true);

    if (error) {
      console.error("Error fetching popular courses:", error);
      return [];
    }

    // Map education_content fields to Course interface
    return data.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category_id || '',
      level: item.content_type || '',
      source_url: item.source_url,
      image_url: item.image_url,
      content_type: item.content_type,
      category_id: item.category_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      isPopular: item.is_featured
    }));
  } catch (error) {
    console.error("Unexpected error in getPopularCourses:", error);
    return [];
  }
};

export const getCoursesWithProgress = async (
  userId?: string
): Promise<(Course & { userProgress?: CourseProgress | null })[]> => {
  try {
    const courses = await getAllCourses();
    
    if (!userId) {
      return courses.map(course => ({ ...course, userProgress: null }));
    }

    const userProgress = await getUserCourseProgress(userId);
    
    return courses.map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        ...course,
        userProgress: progress ? {
          ...progress,
          progress: progress.progress !== undefined ? progress.progress : 0 // Ensure progress property exists
        } : null
      };
    });
  } catch (error) {
    console.error("Error in getCoursesWithProgress:", error);
    return [];
  }
};

export const getCoursesForCategory = async (
  category: string,
  userId?: string
): Promise<(Course & { userProgress?: CourseProgress | null })[]> => {
  try {
    const courses = await getAllCourses();
    const categoryCourses = courses.filter(course => course.category === category);
    
    if (!userId) {
      return categoryCourses.map(course => ({ ...course, userProgress: null }));
    }

    const userProgress = await getUserCourseProgress(userId);
    
    return categoryCourses.map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        ...course,
        userProgress: progress ? {
          ...progress,
          progress: progress.progress !== undefined ? progress.progress : 0 // Ensure progress property exists
        } : null
      };
    });
  } catch (error) {
    console.error("Error in getCoursesForCategory:", error);
    return [];
  }
};

// Add getCourses function needed for Education.tsx
export const getCourses = async (
  level?: string,
  limit: number = 20,
  featured: boolean = false,
  careerInterest?: string
): Promise<Course[]> => {
  try {
    let query = supabase.from("education_content").select("*");

    if (level && level !== "all") {
      query = query.eq("content_type", level);
    }

    if (featured) {
      query = query.eq("is_featured", true);
    }

    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching courses:", error);
      return [];
    }

    // Map education_content fields to Course interface
    const courses = data.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category_id || '',
      level: item.content_type || '',
      source_url: item.source_url,
      image_url: item.image_url,
      content_type: item.content_type,
      category_id: item.category_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      career_interests: [] // This would need to be populated from a related table
    }));

    // Filter by career interest if provided
    if (careerInterest && careerInterest !== "all") {
      // This is a simplified example - in a real app, you'd likely need to fetch this relation from a separate table
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

export const getStaticCourses = (): Course[] => {
  // Return some static courses as fallback
  return [
    {
      id: "1",
      title: "Fashion Design Fundamentals",
      summary: "Learn the basics of fashion design",
      category: "beginner",
      category_id: "beginner",
      level: "beginner",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1583744946564-b52d01e2d443?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-design",
      content_type: "course",
      career_interests: ["designer", "model"]
    },
    {
      id: "2",
      title: "Advanced Pattern Making",
      summary: "Master the art of pattern making",
      category: "advanced",
      category_id: "advanced",
      level: "advanced",
      duration: "12 weeks",
      image_url: "https://images.unsplash.com/photo-1621786030333-c709515feaa4?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/pattern-making",
      content_type: "course",
      career_interests: ["designer"]
    },
    {
      id: "3",
      title: "Fashion Photography Basics",
      summary: "Learn how to capture fashion photography",
      category: "beginner",
      category_id: "beginner",
      level: "beginner",
      duration: "6 weeks",
      image_url: "https://images.unsplash.com/photo-1515549832467-8783363e19b6?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-photography",
      content_type: "course",
      career_interests: ["photographer", "model"]
    }
  ];
};
