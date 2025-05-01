
import { supabase } from "@/integrations/supabase/client";
import { ScrapedCourse } from "../courseTypes";
import { sanitizeScrapedCourse } from "./courseScraperValidation";

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
        level: course.level || 'beginner',
        hash_identifier: course.hash_identifier
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
export const getDuplicateStats = async (): Promise<{
  total: number;
  duplicates: number;
  percentDuplicate: number;
}> => {
  try {
    const { count: totalCount, error: totalError } = await supabase
      .from('scraped_courses')
      .select('*', { count: 'exact', head: true });
      
    const { count: duplicateCount, error: dupError } = await supabase
      .from('scraped_courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_duplicate', true);
    
    if (totalError || dupError) {
      throw new Error('Error fetching duplicate stats');
    }
    
    const total = totalCount || 0;
    const duplicates = duplicateCount || 0;
    const percentDuplicate = total > 0 ? (duplicates / total) * 100 : 0;
    
    return {
      total,
      duplicates,
      percentDuplicate
    };
  } catch (error) {
    console.error('Error in getDuplicateStats:', error);
    return { total: 0, duplicates: 0, percentDuplicate: 0 };
  }
};
