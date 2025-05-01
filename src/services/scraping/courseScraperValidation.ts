
import { supabase } from "@/integrations/supabase/client";
import { Course } from "../courseTypes";
import { logScraperActivity } from "./courseScraperHelpers";

// Check if a course can be updated
export const canUpdateCourse = async (courseId: string): Promise<boolean> => {
  try {
    // Check if the course exists
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    // Additional checks could be added here
    // For example, checking if the course has enrollments
    
    return true;
  } catch (error) {
    console.error("Error checking if course can be updated:", error);
    return false;
  }
};

// Check for duplicate course
export const checkDuplicateCourse = async (title: string): Promise<boolean> => {
  try {
    // Check existing courses
    const { data: existingCourses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .ilike('title', `%${title}%`)
      .limit(1);
    
    if (coursesError) {
      throw coursesError;
    }
    
    if (existingCourses && existingCourses.length > 0) {
      await logScraperActivity('duplicate_check', 'found_match', 'warning', {
        input_title: title,
        matched_title: existingCourses[0].title,
        matched_id: existingCourses[0].id
      });
      return true;
    }
    
    // Check scraped courses
    const { data: existingScraped, error: scrapedError } = await supabase
      .from('scraped_courses')
      .select('id, title')
      .ilike('title', `%${title}%`)
      .limit(1);
    
    if (scrapedError) {
      throw scrapedError;
    }
    
    if (existingScraped && existingScraped.length > 0) {
      await logScraperActivity('duplicate_check', 'found_match_in_scraped', 'warning', {
        input_title: title,
        matched_title: existingScraped[0].title,
        matched_id: existingScraped[0].id
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking for duplicate course:", error);
    await logScraperActivity('duplicate_check', 'error', 'error', { 
      error: error instanceof Error ? error.message : String(error),
      title
    });
    return false;
  }
};

// Sanitize scraped course data
export const sanitizeScrapedCourse = (courseData: any): Partial<Course> => {
  // Basic sanitization
  const sanitized: Partial<Course> = {
    title: courseData.title ? String(courseData.title).trim().substring(0, 255) : "Untitled Course",
    summary: courseData.summary ? String(courseData.summary).trim().substring(0, 1000) : null,
    image_url: courseData.image_url || null,
    video_embed_url: courseData.video_embed_url || null,
    external_link: courseData.external_link || null,
    category: courseData.category || "other",
    level: courseData.level || "beginner",
    hosting_type: courseData.hosting_type || "external",
    scraper_source: courseData.scraper_source || "unknown"
  };
  
  return sanitized;
};
