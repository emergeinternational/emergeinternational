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
  progress: number; // Add the missing progress property
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
    return data.map((item): CourseProgress => ({
      ...item,
      progress: item.progress || 0 // Ensure progress property exists
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
        progress: data.progress || progressValue // Ensure progress exists
      };
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
        progress: data.progress || progressValue // Ensure progress exists
      };
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
      progress: data.progress || 0 // Ensure progress exists
    };
  } catch (error) {
    console.error("Unexpected error in getCourseProgress:", error);
    return null;
  }
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching course by ID:", error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error("Unexpected error in getCourseById:", error);
    return null;
  }
};

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*");

    if (error) {
      console.error("Error fetching all courses:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getAllCourses:", error);
    return [];
  }
};

export const getPopularCourses = async (): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("isPopular", true);

    if (error) {
      console.error("Error fetching popular courses:", error);
      return [];
    }

    return data || [];
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
          progress: progress.progress || 0 // Ensure progress property exists
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
          progress: progress.progress || 0 // Ensure progress property exists
        } : null
      };
    });
  } catch (error) {
    console.error("Error in getCoursesForCategory:", error);
    return [];
  }
};
