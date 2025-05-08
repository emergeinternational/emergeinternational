
import { supabase } from "@/integrations/supabase/client";
import { Course, ScrapedCourse } from "../courseTypes";
import { sanitizeScrapedCourse } from './courseScraperValidation';

// Submit a scraped course to the approval queue
export const submitScrapedCourse = async (
  course: Omit<ScrapedCourse, 'id' | 'created_at' | 'is_approved' | 'is_reviewed'>
): Promise<{success: boolean; id?: string; message?: string}> => {
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
      return { success: false, message: error.message };
    }
    
    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Error in submitScrapedCourse:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
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
export const approveScrapedCourse = async (id: string): Promise<{success: boolean; id?: string; message?: string}> => {
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
    
    return { success: true, id: newCourse.id };
  } catch (error) {
    console.error("Error in approveScrapedCourse:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Reject a scraped course
export const rejectScrapedCourse = async (id: string, reason: string): Promise<{success: boolean; message?: string}> => {
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
  } catch (error) {
    console.error("Error in rejectScrapedCourse:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Get all scraped courses
export const getScrapedCourses = async (): Promise<ScrapedCourse[]> => {
  try {
    const { data, error } = await supabase
      .from('scraped_courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Ensure each course has all the required properties
    return data ? data.map(course => sanitizeScrapedCourse(course)) : [];
  } catch (error) {
    console.error('Error fetching scraped courses:', error);
    return [];
  }
};

// Get scraped courses by source
export const getScrapedCoursesBySource = async (source: string): Promise<ScrapedCourse[]> => {
  try {
    const { data, error } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('scraper_source', source)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data ? data.map(course => sanitizeScrapedCourse(course)) : [];
  } catch (error) {
    console.error('Error fetching scraped courses by source:', error);
    return [];
  }
};

// Get duplicate statistics
export const getDuplicateStats = async (): Promise<{success: boolean; duplicateCount?: number; recentDuplicates?: any[]}> => {
  try {
    // This is a placeholder for a more complex query that might
    // analyze duplicate courses in the system
    const { data: duplicates, error } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('is_duplicate', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return {
      success: true,
      duplicateCount: duplicates?.length || 0,
      recentDuplicates: duplicates?.slice(0, 5) || []
    };
  } catch (error) {
    console.error('Error getting duplicate stats:', error);
    return { success: false };
  }
};

// Trigger a manual scraping operation
export const triggerManualScrape = async (sourceName?: string): Promise<{success: boolean; message?: string}> => {
  try {
    // This would call an edge function to trigger the scraper
    const response = await fetch('/api/trigger-course-scraper', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceName,
        manual: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to trigger scraper: ${response.statusText}`);
    }
    
    const result = await response.json();
    return { success: true, message: 'Scraper triggered successfully' };
  } catch (error) {
    console.error('Error triggering manual scrape:', error);
    return { success: false, message: 'Failed to trigger scraper' };
  }
};
