
import { supabase } from "@/integrations/supabase/client";
import { Course, ScrapedCourse, generateCourseHash } from "../courseTypes";
import { logScraperActivity } from "./courseScraperHelpers";
import { canUpdateCourse, checkDuplicateCourse } from "./courseScraperValidation";

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
    
    // If it's a duplicate with high confidence, mark as duplicate but still add to queue
    const isDuplicateHighConfidence = isDuplicate && confidence >= 80;
    
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
    
    // Log the duplicates for analysis
    if (isDuplicate) {
      await logScraperActivity(
        course.scraper_source,
        "duplicate_detected",
        isDuplicateHighConfidence ? "warning" : "info",
        { 
          scrapedCourseId: data.id, 
          existingCourseId,
          confidence,
          title: course.title
        }
      );
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
    
    // If it's flagged as a duplicate with high confidence, we might want to handle differently
    if (scrapedCourse.is_duplicate && scrapedCourse.duplicate_confidence >= 90 && scrapedCourse.duplicate_of) {
      // Update the existing course if needed instead of creating a new one
      if (await canUpdateCourse(scrapedCourse.duplicate_of)) {
        const { error: updateError } = await supabase
          .from("courses")
          .update({
            updated_at: new Date().toISOString()
            // We could update other fields if needed
          })
          .eq("id", scrapedCourse.duplicate_of);
          
        if (updateError) {
          console.error("Error updating existing course:", updateError);
        }
      }
      
      // Mark the scraped course as reviewed and approved
      await supabase
        .from("scraped_courses")
        .update({
          is_reviewed: true,
          is_approved: true
        })
        .eq("id", id);
        
      return scrapedCourse.duplicate_of;
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
        source_platform: scrapedCourse.scraper_source,
        source_url: scrapedCourse.external_link || scrapedCourse.video_embed_url,
        hash_identifier: scrapedCourse.hash_identifier || 
          generateCourseHash(scrapedCourse.title, scrapedCourse.scraper_source)
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

// Get all courses that were automatically scraped from a specific source
export const getScrapedCoursesBySource = async (source: string): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("source_platform", source)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error getting courses by source:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getScrapedCoursesBySource:", error);
    return [];
  }
};

// Get duplicate detection statistics
export const getDuplicateStats = async (): Promise<{
  totalScraped: number;
  duplicatesDetected: number;
  duplicatesBySource: Record<string, number>;
}> => {
  try {
    // Get total scraped courses
    const { count: totalCount, error: totalError } = await supabase
      .from("scraped_courses")
      .select("*", { count: 'exact', head: true });
    
    // Get duplicates count
    const { count: duplicateCount, error: duplicateError } = await supabase
      .from("scraped_courses")
      .select("*", { count: 'exact', head: true })
      .eq("is_duplicate", true);
    
    // Get duplicates by source
    const { data: duplicatesBySource, error: sourceError } = await supabase
      .from("scraped_courses")
      .select("scraper_source")
      .eq("is_duplicate", true);
    
    if (totalError || duplicateError || sourceError) {
      console.error("Error getting duplicate stats:", { totalError, duplicateError, sourceError });
      return { totalScraped: 0, duplicatesDetected: 0, duplicatesBySource: {} };
    }
    
    // Count duplicates by source
    const sourceCount: Record<string, number> = {};
    if (duplicatesBySource) {
      duplicatesBySource.forEach(course => {
        const source = course.scraper_source;
        if (source) {
          sourceCount[source] = (sourceCount[source] || 0) + 1;
        }
      });
    }
    
    return {
      totalScraped: totalCount || 0,
      duplicatesDetected: duplicateCount || 0,
      duplicatesBySource: sourceCount
    };
  } catch (error) {
    console.error("Error in getDuplicateStats:", error);
    return { totalScraped: 0, duplicatesDetected: 0, duplicatesBySource: {} };
  }
};
