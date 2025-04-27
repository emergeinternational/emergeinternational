
import { supabase } from "@/integrations/supabase/client";

// Function to check if a course can be updated
export const canUpdateCourse = async (courseId: string): Promise<boolean> => {
  try {
    const { data: progressData, error: progressError } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("course_id", courseId)
      .eq("status", "in_progress");
    
    if (progressError) {
      console.error("Error checking course progress:", progressError);
      return false;
    }
    
    if (!progressData || progressData.length === 0) {
      return true;
    }
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const { data: recentActivity, error: activityError } = await supabase
      .from("user_course_progress")
      .select("updated_at")
      .eq("course_id", courseId)
      .gt("updated_at", twoWeeksAgo.toISOString())
      .limit(1);
    
    if (activityError) {
      console.error("Error checking recent activity:", activityError);
      return false;
    }
    
    return !recentActivity || recentActivity.length === 0;
  } catch (error) {
    console.error("Error in canUpdateCourse:", error);
    return false;
  }
};

