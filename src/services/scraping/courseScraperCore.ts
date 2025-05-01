
import { supabase } from "@/integrations/supabase/client";
import { Course, CourseLevel, CourseCategory, CourseHostingType } from "../courseTypes";

// Submit a new scraped course
export const submitScrapedCourse = async (courseData: Partial<Course>): Promise<{ success: boolean; message?: string; id?: string }> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .insert({
        title: courseData.title,
        summary: courseData.summary,
        image_url: courseData.image_url,
        video_embed_url: courseData.video_embed_url,
        external_link: courseData.external_link,
        category: courseData.category as any, // Type assertion
        level: courseData.level as any, // Type assertion
        hosting_type: courseData.hosting_type as any, // Type assertion
        scraper_source: courseData.scraper_source || 'manual',
        is_approved: false,
        is_reviewed: false
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error submitting scraped course:", error);
      return { success: false, message: error.message };
    }
    
    return { success: true, id: data.id };
  } catch (error: any) {
    console.error("Error in submitScrapedCourse:", error);
    return { success: false, message: error.message };
  }
};

// Get pending scraped courses
export const getPendingScrapedCourses = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('is_reviewed', false)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching pending courses:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getPendingScrapedCourses:", error);
    return [];
  }
};

// Approve a scraped course and add it to courses table
export const approveScrapedCourse = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    // Get the course data
    const { data: scrapedCourse, error: fetchError } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error("Error fetching scraped course:", fetchError);
      return { success: false, message: fetchError.message };
    }
    
    // Insert into courses table
    const { error: insertError } = await supabase
      .from('courses')
      .insert({
        title: scrapedCourse.title,
        summary: scrapedCourse.summary,
        image_url: scrapedCourse.image_url,
        video_embed_url: scrapedCourse.video_embed_url,
        external_link: scrapedCourse.external_link,
        category: scrapedCourse.category,
        level: scrapedCourse.level,
        hosting_type: scrapedCourse.hosting_type,
        is_published: true
      });
    
    if (insertError) {
      console.error("Error inserting course:", insertError);
      return { success: false, message: insertError.message };
    }
    
    // Update scraped course status
    const { error: updateError } = await supabase
      .from('scraped_courses')
      .update({ 
        is_reviewed: true, 
        is_approved: true,
        review_notes: 'Approved and added to courses'
      })
      .eq('id', id);
    
    if (updateError) {
      console.error("Error updating scraped course status:", updateError);
      return { success: false, message: updateError.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error("Error in approveScrapedCourse:", error);
    return { success: false, message: error.message };
  }
};

// Reject a scraped course
export const rejectScrapedCourse = async (id: string, notes: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const { error } = await supabase
      .from('scraped_courses')
      .update({ 
        is_reviewed: true, 
        is_approved: false,
        review_notes: notes
      })
      .eq('id', id);
    
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

// Trigger manual scrape - This function is added to fix the missing export error
export const triggerManualScrape = async (source: string): Promise<{ success: boolean; message?: string; }> => {
  try {
    // This would typically call an edge function or other service to trigger scraping
    // For now, we'll just log that it was triggered and return success
    console.log(`Manual scrape triggered for source: ${source}`);
    
    // Log scraper activity
    await logScraperActivity(source, 'manual_trigger', 'success', { timestamp: new Date().toISOString() });
    
    return { success: true, message: `Started manual scrape for ${source}` };
  } catch (error: any) {
    console.error("Error triggering manual scrape:", error);
    return { success: false, message: error.message };
  }
};

// Get stats on potential duplicates
export const getDuplicateStats = async (): Promise<any> => {
  try {
    // This would typically query the database for potential duplicates
    // For now, we'll return a mock response
    return {
      potentialDuplicates: 0,
      lastChecked: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting duplicate stats:", error);
    return {
      error: "Failed to get duplicate stats",
      potentialDuplicates: 0
    };
  }
};
