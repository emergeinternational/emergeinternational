
import { supabase } from "@/integrations/supabase/client";
import { ScrapedCourse, CourseCategory, CourseLevel, HostingType } from "../courseTypes";
import { sanitizeScrapedCourse } from './courseScraperValidation';

// Submit a scraped course to the approval queue
export const submitScrapedCourse = async (
  course: Omit<ScrapedCourse, 'id' | 'created_at' | 'is_approved' | 'is_reviewed'>
): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .insert({
        title: course.title,
        summary: course.summary,
        category: course.category,
        level: course.level || 'beginner',
        image_url: course.image_url,
        video_embed_url: course.video_embed_url,
        external_link: course.external_link,
        hosting_type: course.hosting_type,
        is_approved: false,
        is_reviewed: false,
        scraper_source: course.scraper_source,
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
    
    return data || [];
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
        image_url: scrapedCourse.image_url,
        video_embed_url: scrapedCourse.video_embed_url,
        external_link: scrapedCourse.external_link,
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

// Get scraped courses by source
export const getScrapedCoursesBySource = async (source: string): Promise<ScrapedCourse[]> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .select("*")
      .eq("scraper_source", source)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error getting scraped courses by source:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Error in getScrapedCoursesBySource:", error);
    return [];
  }
};

// Get duplicate stats
export const getDuplicateStats = async (): Promise<{
  total: number;
  duplicates: number;
  approved: number;
  rejected: number;
}> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .select("is_duplicate, is_approved, is_reviewed");
    
    if (error) {
      console.error("Error getting duplicate stats:", error);
      return {
        total: 0,
        duplicates: 0,
        approved: 0,
        rejected: 0
      };
    }
    
    const total = data.length;
    const duplicates = data.filter(c => c.is_duplicate).length;
    const approved = data.filter(c => c.is_approved).length;
    const rejected = data.filter(c => c.is_reviewed && !c.is_approved).length;
    
    return {
      total,
      duplicates,
      approved,
      rejected
    };
  } catch (error) {
    console.error("Error in getDuplicateStats:", error);
    return {
      total: 0,
      duplicates: 0,
      approved: 0,
      rejected: 0
    };
  }
};
