
import { supabase } from "@/integrations/supabase/client";
import { Course, CourseLevel, CourseCategory, CourseHostingType } from "../courseTypes";

// Log scraper activity
export const logScraperActivity = async (
  source: string, 
  action: string, 
  status: 'success' | 'warning' | 'error', 
  details: any
): Promise<void> => {
  try {
    await supabase
      .from("automation_logs")
      .insert({
        function_name: `scraper:${source}`,
        results: {
          action,
          status,
          details
        }
      });
  } catch (error) {
    console.error("Error logging scraper activity:", error);
  }
};

// Create a verified course directly (for manual course creation)
export const createVerifiedCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; message?: string; id?: string }> => {
  try {
    const validatedData = {
      ...courseData,
      category: courseData.category as CourseCategory,
      level: courseData.level || 'beginner' as CourseLevel,
      hosting_type: courseData.hosting_type as CourseHostingType
    };
    
    const { data, error } = await supabase
      .from("courses")
      .insert(validatedData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating verified course:", error);
      return { success: false, message: error.message };
    }
    
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error("Error in createVerifiedCourse:", error);
    return { success: false, message: error.message };
  }
};
