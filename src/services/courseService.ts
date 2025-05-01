
import { supabase } from "@/integrations/supabase/client";
import { CourseCategory, CourseLevel, Course, CourseProgress } from "./courseTypes";
import { getStaticCourses as fetchStaticCourses } from "./staticCoursesData";

// Export the getStaticCourses function from staticCoursesData
export const getStaticCourses = fetchStaticCourses;

// Get all published courses
export const getAllCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching courses:", error);
    return [];
  }

  return data as Course[];
};

// Get published courses
export const getPublishedCourses = async (): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching published courses:", error);
    return [];
  }

  return data as Course[];
};

// Get course by ID
export const getCourseById = async (id: string): Promise<Course | null> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching course with ID ${id}:`, error);
    return null;
  }

  return data as Course;
};

// Get courses by category
export const getCoursesByCategory = async (category: CourseCategory): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("category", category)
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(`Error fetching courses with category ${category}:`, error);
      return [];
    }

    return data as Course[];
  } catch (error) {
    console.error(`Error in getCoursesByCategory:`, error);
    return [];
  }
};

// Get courses by level
export const getCoursesByLevel = async (level: CourseLevel): Promise<Course[]> => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("level", level)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(`Error fetching courses with level ${level}:`, error);
    return [];
  }

  return data as Course[];
};

// Create a new course
export const createCourse = async (course: Omit<Course, "id" | "created_at" | "updated_at">): Promise<Course | null> => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .insert({
        title: course.title,
        summary: course.summary,
        image_url: course.image_url,
        video_embed_url: course.video_embed_url,
        external_link: course.external_link,
        is_published: course.is_published,
        category: course.category,
        level: course.level,
        hosting_type: course.hosting_type,
        price: course.price
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating course:", error);
      return null;
    }

    return data as Course;
  } catch (error) {
    console.error("Error in createCourse:", error);
    return null;
  }
};

// Update a course
export const updateCourse = async (id: string, updates: Partial<Course>): Promise<boolean> => {
  const { error } = await supabase
    .from("courses")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error(`Error updating course with ID ${id}:`, error);
    return false;
  }

  return true;
};

// Delete a course
export const deleteCourse = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting course with ID ${id}:`, error);
    return false;
  }

  return true;
};

// Track course engagement
export const trackCourseEngagement = async (courseId: string): Promise<void> => {
  try {
    // Check for existing engagement record
    const { data: existing, error: checkError } = await supabase
      .from("course_engagement")
      .select("id, total_clicks")
      .eq("course_id", courseId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // Error other than "no rows found"
      console.error("Error checking course engagement:", checkError);
      return;
    }

    if (existing) {
      // Update existing record
      await supabase
        .from("course_engagement")
        .update({
          total_clicks: existing.total_clicks + 1,
          last_click_date: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      // Create new record
      await supabase
        .from("course_engagement")
        .insert({
          course_id: courseId,
          total_clicks: 1
        });
    }
  } catch (error) {
    console.error("Error tracking course engagement:", error);
  }
};

// Get course progress for a user
export const getCourseProgress = async (courseId: string, userId: string): Promise<CourseProgress | null> => {
  try {
    const { data, error } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching course progress:", error);
      return null;
    }

    return data as CourseProgress;
  } catch (error) {
    console.error("Error in getCourseProgress:", error);
    return null;
  }
};
