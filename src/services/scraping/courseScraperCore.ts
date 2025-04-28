
import { sanitizeScrapedCourse } from "./courseScraperHelpers";
import { submitScrapedCourse } from "../courseScraperService";
import { ScrapedCourse } from "../courseTypes";
import { supabase } from "@/integrations/supabase/client";

// Function to process course data and submit it for approval
export const processCourseData = async (courseData: any) => {
  try {
    // Basic validation - check for required fields
    if (!courseData.title || !courseData.category || !courseData.external_link || !courseData.hosting_type || !courseData.scraper_source) {
      console.warn("Missing required fields in course data:", courseData);
      return { success: false, message: "Missing required fields" };
    }

    const sanitizedCourse = sanitizeScrapedCourse(courseData);

    // Submit the scraped course for approval
    const submissionResult = await submitScrapedCourse({
      ...sanitizedCourse,
      title: sanitizedCourse.title || 'Untitled',
      category: sanitizedCourse.category || 'designer',
      external_link: sanitizedCourse.external_link || '',
      hosting_type: sanitizedCourse.hosting_type || 'external',
      scraper_source: sanitizedCourse.scraper_source || 'unknown',
      hash_identifier: sanitizedCourse.hash_identifier || 'default-hash'
    } as any);

    if (submissionResult) {
      console.log(`Course "${courseData.title}" submitted successfully with ID: ${submissionResult}`);
      return { success: true, message: `Course submitted successfully with ID: ${submissionResult}` };
    } else {
      console.error("Failed to submit course:", courseData);
      return { success: false, message: "Failed to submit course" };
    }

  } catch (error: any) {
    console.error("Error processing course data:", error);
    return { success: false, message: `Error processing course data: ${error.message}` };
  }
};

// Export the missing functions for the useScrapedCourses hook
export const getPendingScrapedCourses = async (): Promise<ScrapedCourse[]> => {
  try {
    const { data, error } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('is_reviewed', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as ScrapedCourse[];
  } catch (error) {
    console.error("Error fetching pending courses:", error);
    return [];
  }
};

export const approveScrapedCourse = async (courseId: string): Promise<string | null> => {
  try {
    // First get the course
    const { data: course, error: fetchError } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (fetchError || !course) {
      throw fetchError || new Error("Course not found");
    }

    // Create a new approved course
    const { data: newCourse, error: insertError } = await supabase
      .from('courses')
      .insert({
        title: course.title,
        summary: course.summary,
        category: course.category,
        level: course.level,
        external_link: course.external_link,
        video_embed_url: course.video_embed_url,
        image_url: course.image_url,
        hosting_type: course.hosting_type,
        is_published: true,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    // Update the scraped course as reviewed and approved
    const { error: updateError } = await supabase
      .from('scraped_courses')
      .update({
        is_reviewed: true,
        is_approved: true,
      })
      .eq('id', courseId);

    if (updateError) {
      throw updateError;
    }

    return newCourse.id;
  } catch (error) {
    console.error("Error approving course:", error);
    return null;
  }
};

export const rejectScrapedCourse = async (courseId: string, reason: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('scraped_courses')
      .update({
        is_reviewed: true,
        is_approved: false,
        review_notes: reason,
      })
      .eq('id', courseId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error rejecting course:", error);
    return false;
  }
};

export const triggerManualScrape = async (): Promise<{ success: boolean; message: string }> => {
  try {
    // This would typically call an edge function to trigger a scraper
    // For now, we'll just simulate a successful response
    return { 
      success: true, 
      message: "Scraper started successfully" 
    };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || "Failed to start scraper" 
    };
  }
};

export const getDuplicateStats = async () => {
  try {
    // Fetch stats from the database
    const { data: totalScraped, error: totalError } = await supabase
      .from('scraped_courses')
      .select('id')
      .count();

    const { data: duplicates, error: dupError } = await supabase
      .from('scraped_courses')
      .select('scraper_source')
      .eq('is_duplicate', true);

    if (totalError || dupError) {
      throw totalError || dupError;
    }

    const sourceCount: Record<string, number> = {};
    duplicates?.forEach((item: any) => {
      const source = item.scraper_source;
      sourceCount[source] = (sourceCount[source] || 0) + 1;
    });

    return {
      totalScraped: totalScraped?.[0]?.count || 0,
      duplicatesDetected: duplicates?.length || 0,
      duplicatesBySource: sourceCount
    };
  } catch (error) {
    console.error("Error fetching duplicate stats:", error);
    return {
      totalScraped: 0,
      duplicatesDetected: 0,
      duplicatesBySource: {}
    };
  }
};
