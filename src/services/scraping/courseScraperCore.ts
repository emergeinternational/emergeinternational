import { supabase } from "@/integrations/supabase/client";
import { Course, ScrapedCourse } from "../courseTypes";
import { logScraperActivity } from "./courseScraperHelpers";
import { canUpdateCourse } from "./courseScraperValidation";

// Submit a scraped course to the approval queue
export const submitScrapedCourse = async (
  course: Omit<ScrapedCourse, 'id' | 'created_at' | 'is_approved' | 'is_reviewed'>
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .insert({
        ...course,
        is_approved: false,
        is_reviewed: false,
        level: course.level || 'beginner'
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error submitting scraped course:", error);
      return null;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error("Error in submitScrapedCourse:", error);
    return null;
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
    
    return data;
  } catch (error) {
    console.error("Error in getPendingScrapedCourses:", error);
    return [];
  }
};

// Approve a scraped course
export const approveScrapedCourse = async (id: string): Promise<string | null> => {
  try {
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
        is_published: true
      })
      .select()
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

// Function to manually trigger the scraper
export const triggerManualScrape = async (): Promise<{ success: boolean, message: string }> => {
  try {
    const { data, error } = await supabase.functions.invoke('course-scraper', {
      body: { scheduled: false }
    });
    
    if (error) {
      console.error("Error triggering scraper:", error);
      return { success: false, message: "Failed to trigger scraper" };
    }

    return { 
      success: true, 
      message: `Scraper completed. Results: ${JSON.stringify(data.results)}` 
    };
  } catch (error) {
    console.error("Unexpected error triggering scraper:", error);
    return { success: false, message: "Unexpected error occurred" };
  }
};
