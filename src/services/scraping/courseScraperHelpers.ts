
import { supabase } from "@/integrations/supabase/client";
import { Course } from "../courseTypes";

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
export const createVerifiedCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
  try {
    // Extract the specific fields we want to insert
    const validatedData = {
      title: courseData.title,
      summary: courseData.summary,
      category: courseData.category,
      level: courseData.level || 'beginner',
      image_url: courseData.image_url,
      video_embed_url: courseData.video_embed_url,
      external_link: courseData.external_link,
      hosting_type: courseData.hosting_type,
      is_published: courseData.is_published ?? false,
      price: courseData.price
    };
    
    const { data, error } = await supabase
      .from("courses")
      .insert(validatedData)
      .select()
      .single();
    
    if (error) {
      console.error("Error creating verified course:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in createVerifiedCourse:", error);
    return null;
  }
};
