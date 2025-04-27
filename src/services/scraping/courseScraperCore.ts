
import { supabase } from "@/integrations/supabase/client";
import { ScrapedCourse, generateCourseHash } from "../courseTypes";
import { logScraperActivity } from "./courseScraperHelpers";
import { checkDuplicateCourse } from "./duplicateDetection";
import { handleDuplicateDetection, getDuplicateStats } from "./duplicateDetection";
import { 
  getPendingScrapedCourses, 
  approveScrapedCourse, 
  rejectScrapedCourse, 
  getScrapedCoursesBySource 
} from "./courseManager";

// Submit a scraped course to the approval queue
export const submitScrapedCourse = async (
  course: Omit<ScrapedCourse, 'id' | 'created_at' | 'is_approved' | 'is_reviewed'>
): Promise<string | null> => {
  try {
    // Check if course already exists
    const { isDuplicate, existingCourseId, confidence } = await checkDuplicateCourse(
      course.title,
      course.scraper_source,
      course.external_link || course.video_embed_url
    );
    
    // Generate hash identifier if not provided
    const hashIdentifier = course.hash_identifier || 
      generateCourseHash(course.title, course.scraper_source);
    
    const { data, error } = await supabase
      .from("scraped_courses")
      .insert({
        ...course,
        is_approved: false,
        is_reviewed: false,
        level: course.level || 'beginner',
        hash_identifier: hashIdentifier,
        is_duplicate: isDuplicate,
        duplicate_confidence: confidence,
        duplicate_of: isDuplicate ? existingCourseId : null
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error submitting scraped course:", error);
      return null;
    }
    
    // Log duplicates for analysis
    if (isDuplicate && data) {
      await handleDuplicateDetection(
        data.id,
        course.title,
        course.scraper_source,
        isDuplicate,
        existingCourseId,
        confidence
      );
    }
    
    return data?.id || null;
  } catch (error) {
    console.error("Error in submitScrapedCourse:", error);
    return null;
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

// Re-export functions from other files for backwards compatibility
export {
  getPendingScrapedCourses,
  approveScrapedCourse,
  rejectScrapedCourse,
  getScrapedCoursesBySource,
  getDuplicateStats
};
