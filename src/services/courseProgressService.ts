
import { supabase } from "@/integrations/supabase/client";
import type { CourseProgress } from "./courseTypes";
import { sanitizeCourseProgress } from "./courseTypes";

export const getUserCourseProgress = async (
  userId: string
): Promise<CourseProgress[]> => {
  try {
    const { data, error } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user course progress:", error);
      return [];
    }

    return data.map(item => sanitizeCourseProgress(item));
  } catch (error) {
    console.error("Error in getUserCourseProgress:", error);
    return [];
  }
};

export const getCourseProgress = async (
  userId: string,
  courseId: string
): Promise<CourseProgress | null> => {
  try {
    const { data, error } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (error || !data) {
      console.error("Error fetching course progress:", error);
      return null;
    }

    return sanitizeCourseProgress(data);
  } catch (error) {
    console.error("Error in getCourseProgress:", error);
    return null;
  }
};

export const updateCourseProgress = async (
  userId: string,
  courseId: string,
  progress: number,
  status: "not_started" | "started" | "in_progress" | "completed" = "in_progress"
): Promise<CourseProgress | null> => {
  try {
    const currentDate = new Date().toISOString();
    let updateData: any = {
      progress,
      status,
      updated_at: currentDate
    };
    
    if (status === "completed" && progress >= 100) {
      updateData.date_completed = currentDate;
    }
    
    // Check if a progress record already exists
    const { data: existingProgress } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    
    let result;
    
    if (existingProgress) {
      const { data, error } = await supabase
        .from("user_course_progress")
        .update(updateData)
        .eq("id", existingProgress.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating course progress:", error);
        return null;
      }
      
      result = data;
    } else {
      // No record exists, create a new one
      const { data, error } = await supabase
        .from("user_course_progress")
        .insert({
          user_id: userId,
          course_id: courseId,
          progress,
          status,
          date_started: currentDate,
          updated_at: currentDate
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating course progress:", error);
        return null;
      }
      
      result = data;
    }
    
    return sanitizeCourseProgress(result);
  } catch (error) {
    console.error("Error in updateCourseProgress:", error);
    return null;
  }
};

export const calculateCourseCompletion = async (userId: string): Promise<{ 
  total: number; 
  completed: number;
  byCategory: Record<string, { total: number; completed: number }>;
}> => {
  try {
    const { data, error } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("user_id", userId);
    
    if (error) {
      console.error("Error calculating course completion:", error);
      return { 
        total: 0, 
        completed: 0,
        byCategory: {}
      };
    }
    
    const byCategory: Record<string, { total: number; completed: number }> = {};
    let totalCompleted = 0;
    
    data.forEach(progress => {
      const category = progress.course_category || "uncategorized";
      
      if (!byCategory[category]) {
        byCategory[category] = { total: 0, completed: 0 };
      }
      
      byCategory[category].total++;
      
      if (progress.status === "completed" || progress.progress >= 100) {
        byCategory[category].completed++;
        totalCompleted++;
      }
    });
    
    return {
      total: data.length,
      completed: totalCompleted,
      byCategory
    };
  } catch (error) {
    console.error("Error in calculateCourseCompletion:", error);
    return { 
      total: 0, 
      completed: 0,
      byCategory: {}
    };
  }
};
