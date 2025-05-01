
import { supabase } from "@/integrations/supabase/client";
import { ScrapedCourse } from "../courseTypes";
import { sanitizeScrapedCourse } from "../courseTypes";
import { logScraperActivity } from "./courseScraperHelpers";
import { canUpdateCourse, checkDuplicateCourse } from "./courseScraperValidation";

// Submit a scraped course to the approval queue
export const submitScrapedCourse = async (
  course: Omit<ScrapedCourse, 'id' | 'created_at' | 'is_approved' | 'is_reviewed'>
): Promise<{ success: boolean; message?: string; id?: string }> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .insert({
        ...course,
        is_approved: false,
        is_reviewed: false,
        level: course.level || 'beginner',
        hash_identifier: course.hash_identifier
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error submitting scraped course:", error);
      return { success: false, message: error.message };
    }
    
    return { success: true, id: data?.id };
  } catch (error: any) {
    console.error("Error in submitScrapedCourse:", error);
    return { success: false, message: error.message };
  }
};

// Get all pending scraped courses
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
    
    return data || [];
  } catch (error) {
    console.error("Error in getPendingScrapedCourses:", error);
    return [];
  }
};

// Approve a scraped course
export const approveScrapedCourse = async (id: string): Promise<{ success: boolean; message?: string; courseId?: string }> => {
  try {
    const { data: scrapedCourse, error: fetchError } = await supabase
      .from("scraped_courses")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError || !scrapedCourse) {
      console.error("Error fetching scraped course:", fetchError);
      return { success: false, message: fetchError?.message || "Course not found" };
    }
    
    // Create a new course from the scraped data
    const courseData = {
      title: scrapedCourse.title,
      summary: scrapedCourse.summary,
      category: scrapedCourse.category,
      level: scrapedCourse.level || 'beginner',
      video_embed_url: scrapedCourse.video_embed_url,
      external_link: scrapedCourse.external_link,
      image_url: scrapedCourse.image_url,
      hosting_type: scrapedCourse.hosting_type,
      is_published: true
    };
    
    const { data: newCourse, error: insertError } = await supabase
      .from("courses")
      .insert(courseData)
      .select()
      .single();
    
    if (insertError) {
      console.error("Error creating new course:", insertError);
      return { success: false, message: insertError.message };
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
      return { success: false, message: updateError.message };
    }
    
    return { success: true, courseId: newCourse.id };
  } catch (error: any) {
    console.error("Error in approveScrapedCourse:", error);
    return { success: false, message: error.message };
  }
};

// Reject a scraped course
export const rejectScrapedCourse = async (id: string, reason: string): Promise<{ success: boolean; message?: string }> => {
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
      return { success: false, message: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error in rejectScrapedCourse:", error);
    return { success: false, message: error.message };
  }
};

// Get scraped courses by source
export const getScrapedCoursesBySource = async (source: string): Promise<ScrapedCourse[]> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .select("*")
      .eq("scraper_source", source)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error(`Error fetching courses from source ${source}:`, error);
    return [];
  }
};

// Get duplicate statistics
export const getDuplicateStats = async (): Promise<{ success: boolean; duplicateCount?: number; duplicatesBySource?: Record<string, number> }> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .select("scraper_source")
      .eq("is_duplicate", true);
    
    if (error) throw error;
    
    const duplicatesBySource: Record<string, number> = {};
    data?.forEach(course => {
      const source = course.scraper_source || 'unknown';
      duplicatesBySource[source] = (duplicatesBySource[source] || 0) + 1;
    });
    
    return {
      success: true,
      duplicateCount: data?.length || 0,
      duplicatesBySource
    };
  } catch (error) {
    console.error("Error getting duplicate stats:", error);
    return { success: false };
  }
};

// Trigger a manual scrape
export const triggerManualScrape = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    // Call the edge function or API endpoint to trigger scraping
    // For now, we'll just simulate with a log
    await logScraperActivity("manual", "scrape_triggered", "success", { timestamp: new Date().toISOString() });
    
    // In the future, this would call your actual scraper function or edge function
    
    return { success: true, message: "Manual scrape triggered successfully" };
  } catch (error: any) {
    console.error("Error triggering manual scrape:", error);
    return { success: false, message: error.message };
  }
};
