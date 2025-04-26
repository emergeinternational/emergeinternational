
import { supabase } from "@/integrations/supabase/client";
import type { CourseProgress } from "./courseTypes";

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

    return data.map((item): CourseProgress => ({
      ...item,
      progress: typeof item.progress === 'number' ? item.progress : 0
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
    const { data: existingProgress } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingProgress) {
      const { data, error } = await supabase
        .from("user_course_progress")
        .update({
          status,
          progress: progressValue,
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
        progress: typeof data.progress === 'number' ? data.progress : progressValue
      } as CourseProgress;
    } else {
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
        progress: typeof data.progress === 'number' ? data.progress : progressValue
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
      progress: typeof data.progress === 'number' ? data.progress : 0
    } as CourseProgress;
  } catch (error) {
    console.error("Unexpected error in getCourseProgress:", error);
    return null;
  }
};

