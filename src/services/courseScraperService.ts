
import { supabase } from "@/integrations/supabase/client";
import { Course, ScrapedCourse } from "./courseTypes";
import { trackCourseEngagement } from "./courseDataService";
import { useToast } from "@/hooks/use-toast";

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

// Submit a scraped course to the approval queue
export const submitScrapedCourse = async (course: Omit<ScrapedCourse, 'id' | 'created_at' | 'is_approved' | 'is_reviewed'>): Promise<string | null> => {
  try {
    // Type assertion to any to work around the type limitations with the Supabase client
    const { data, error } = await (supabase
      .from("scraped_courses" as any)
      .insert({
        ...course,
        is_approved: false,
        is_reviewed: false
      })
      .select() as any);
    
    if (error) {
      console.error("Error submitting scraped course:", error);
      return null;
    }
    
    return data?.[0]?.id || null;
  } catch (error) {
    console.error("Error in submitScrapedCourse:", error);
    return null;
  }
};

// Get all pending scraped courses
export const getPendingScrapedCourses = async (): Promise<ScrapedCourse[]> => {
  try {
    // Type assertion to overcome the Supabase client limitations
    const { data, error } = await (supabase
      .from("scraped_courses" as any)
      .select("*")
      .eq("is_reviewed", false)
      .order("created_at", { ascending: false }) as any);
    
    if (error) {
      console.error("Error getting pending scraped courses:", error);
      return [];
    }
    
    return data as ScrapedCourse[];
  } catch (error) {
    console.error("Error in getPendingScrapedCourses:", error);
    return [];
  }
};

// Approve a scraped course
export const approveScrapedCourse = async (id: string): Promise<string | null> => {
  try {
    // Type assertion to overcome the Supabase client limitations
    const { data: scrapedCourse, error: fetchError } = await (supabase
      .from("scraped_courses" as any)
      .select("*")
      .eq("id", id)
      .single() as any);
    
    if (fetchError || !scrapedCourse) {
      console.error("Error fetching scraped course:", fetchError);
      return null;
    }
    
    // Create a new course from the scraped data
    const { data: newCourse, error: insertError } = await supabase
      .from("courses")
      .insert({
        title: scrapedCourse.title,
        summary: scrapedCourse.summary,
        category: scrapedCourse.category,
        level: scrapedCourse.level,
        video_embed_url: scrapedCourse.video_embed_url,
        external_link: scrapedCourse.external_link,
        image_url: scrapedCourse.image_url,
        hosting_type: scrapedCourse.hosting_type,
        is_published: true
      })
      .select()
      .single();
    
    if (insertError) {
      console.error("Error creating new course:", insertError);
      return null;
    }
    
    // Mark the scraped course as reviewed and approved
    const { error: updateError } = await (supabase
      .from("scraped_courses" as any)
      .update({
        is_reviewed: true,
        is_approved: true
      })
      .eq("id", id) as any);
    
    if (updateError) {
      console.error("Error updating scraped course:", updateError);
    }
    
    return newCourse.id;
  } catch (error) {
    console.error("Error in approveScrapedCourse:", error);
    return null;
  }
};

// Reject a scraped course
export const rejectScrapedCourse = async (id: string, reason: string): Promise<boolean> => {
  try {
    const { error } = await (supabase
      .from("scraped_courses" as any)
      .update({
        is_reviewed: true,
        is_approved: false,
        review_notes: reason
      })
      .eq("id", id) as any);
    
    if (error) {
      console.error("Error rejecting scraped course:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in rejectScrapedCourse:", error);
    return false;
  }
};

// Log scraper activity
export const logScraperActivity = async (
  source: string, 
  action: string, 
  status: 'success' | 'warning' | 'error', 
  details: any
): Promise<void> => {
  try {
    await (supabase
      .from("automation_logs")
      .insert({
        function_name: `scraper:${source}`,
        results: {
          action,
          status,
          details
        }
      }) as any);
  } catch (error) {
    console.error("Error logging scraper activity:", error);
  }
};

// Create a verified course directly (for manual course creation)
export const createVerifiedCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
  try {
    // Need to cast the courseData to make TypeScript happy with the strict category types
    const typedCourseData = {
      ...courseData,
      category: courseData.category as any,
      level: courseData.level as any,
      hosting_type: courseData.hosting_type as 'hosted' | 'embedded' | 'external'
    };
    
    const { data, error } = await supabase
      .from("courses")
      .insert(typedCourseData)
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
