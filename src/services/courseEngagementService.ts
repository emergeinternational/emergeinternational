
import { supabase } from "@/integrations/supabase/client";

// Track user engagement with a course
export const trackCourseEngagement = async (courseId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("course_engagement")
      .insert({
        course_id: courseId,
        timestamp: new Date().toISOString(),
      });
    
    if (error) {
      console.error("Error tracking course engagement:", error);
    }
  } catch (error) {
    console.error("Error in trackCourseEngagement:", error);
  }
};

// Get engagement metrics for a course
export const getCourseEngagementMetrics = async (courseId: string): Promise<{
  views: number;
  completions: number;
  averageProgress: number;
}> => {
  try {
    // Get total views
    const { count: views, error: viewsError } = await supabase
      .from("course_engagement")
      .select("*", { count: 'exact', head: true })
      .eq("course_id", courseId);
    
    if (viewsError) {
      console.error("Error fetching course views:", viewsError);
    }
    
    // Get completions
    const { count: completions, error: completionsError } = await supabase
      .from("user_course_progress")
      .select("*", { count: 'exact', head: true })
      .eq("course_id", courseId)
      .eq("status", "completed");
    
    if (completionsError) {
      console.error("Error fetching course completions:", completionsError);
    }
    
    // Get average progress
    const { data: progressData, error: progressError } = await supabase
      .from("user_course_progress")
      .select("progress")
      .eq("course_id", courseId);
    
    if (progressError) {
      console.error("Error fetching course progress:", progressError);
    }
    
    let averageProgress = 0;
    
    if (progressData && progressData.length > 0) {
      averageProgress = progressData.reduce((sum, item) => sum + (item.progress || 0), 0) / progressData.length;
    }
    
    return {
      views: views || 0,
      completions: completions || 0,
      averageProgress
    };
  } catch (error) {
    console.error("Error in getCourseEngagementMetrics:", error);
    return {
      views: 0,
      completions: 0,
      averageProgress: 0
    };
  }
};
