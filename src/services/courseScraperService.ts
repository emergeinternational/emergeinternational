
import { supabase } from "@/integrations/supabase/client";
import { Course, ScrapedCourse } from "./courseTypes";
import { trackCourseEngagement } from "./courseDataService";
import { useToast } from "@/hooks/use-toast";

// Constants for scraping configuration
const SCRAPING_INTERVAL_DAYS = 14; // 2 weeks
const REQUIRED_INACTIVITY_DAYS = 14; // 2 weeks of inactivity

// Function to check if a course can be updated (no active students or inactive for 2 weeks)
export const canUpdateCourse = async (courseId: string): Promise<boolean> => {
  try {
    // Check if course has active students
    const { data: progressData, error: progressError } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("course_id", courseId)
      .eq("status", "in_progress");
    
    if (progressError) {
      console.error("Error checking course progress:", progressError);
      return false;
    }
    
    // If no active students, course can be updated
    if (!progressData || progressData.length === 0) {
      return true;
    }
    
    // Check if there's been activity in the last 2 weeks
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - REQUIRED_INACTIVITY_DAYS);
    
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
    
    // If no recent activity, course can be updated
    return !recentActivity || recentActivity.length === 0;
  } catch (error) {
    console.error("Error in canUpdateCourse:", error);
    return false;
  }
};

// Function to lock a course
export const lockCourse = async (courseId: string, reason: string, lockUntil?: Date): Promise<boolean> => {
  try {
    const lockDate = lockUntil || new Date();
    if (!lockUntil) {
      // Default to 2 weeks from now if not specified
      lockDate.setDate(lockDate.getDate() + REQUIRED_INACTIVITY_DAYS);
    }
    
    const { error } = await supabase
      .from("courses")
      .update({
        is_locked: true,
        locked_reason: reason,
        locked_until: lockDate.toISOString()
      })
      .eq("id", courseId);
    
    if (error) {
      console.error("Error locking course:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in lockCourse:", error);
    return false;
  }
};

// Function to unlock a course
export const unlockCourse = async (courseId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("courses")
      .update({
        is_locked: false,
        locked_reason: null,
        locked_until: null
      })
      .eq("id", courseId);
    
    if (error) {
      console.error("Error unlocking course:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in unlockCourse:", error);
    return false;
  }
};

// Function to submit a scraped course to the approval queue
export const submitScrapedCourse = async (course: Omit<ScrapedCourse, 'id' | 'created_at' | 'is_approved' | 'is_reviewed'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .insert({
        ...course,
        is_approved: false,
        is_reviewed: false
      })
      .select('id')
      .single();
    
    if (error) {
      console.error("Error submitting scraped course:", error);
      return null;
    }
    
    return data.id;
  } catch (error) {
    console.error("Error in submitScrapedCourse:", error);
    return null;
  }
};

// Function to get all pending scraped courses
export const getPendingScrapedCourses = async (): Promise<ScrapedCourse[]> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .select("*")
      .eq("is_reviewed", false)
      .order("created_at", { ascending: false });
    
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

// Function to approve a scraped course
export const approveScrapedCourse = async (id: string): Promise<string | null> => {
  try {
    // First get the scraped course
    const { data: scrapedCourse, error: fetchError } = await supabase
      .from("scraped_courses")
      .select("*")
      .eq("id", id)
      .single();
    
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
        is_published: true,
        scraper_source: scrapedCourse.scraper_source
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error("Error creating new course:", insertError);
      return null;
    }
    
    // Mark the scraped course as reviewed and approved
    const { error: updateError } = await supabase
      .from("scraped_courses")
      .update({
        is_reviewed: true,
        is_approved: true
      })
      .eq("id", id);
    
    if (updateError) {
      console.error("Error updating scraped course:", updateError);
      // The course was created but we couldn't update the status
      // This is not critical, so we return the new course ID anyway
    }
    
    return newCourse.id;
  } catch (error) {
    console.error("Error in approveScrapedCourse:", error);
    return null;
  }
};

// Function to reject a scraped course
export const rejectScrapedCourse = async (id: string, reason: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("scraped_courses")
      .update({
        is_reviewed: true,
        is_approved: false,
        review_notes: reason
      })
      .eq("id", id);
    
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

// Manually create a new course (fully verified)
export const createVerifiedCourse = async (course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .insert({
        ...course,
        is_published: true
      })
      .select('id')
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

// Log scraper activity for monitoring
export const logScraperActivity = async (
  source: string, 
  action: string, 
  status: 'success' | 'error', 
  details: any
): Promise<void> => {
  try {
    await supabase
      .from("scraper_logs")
      .insert({
        source,
        action,
        status,
        details: JSON.stringify(details),
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error("Error logging scraper activity:", error);
    // Don't throw - this is just logging
  }
};
