
import { supabase } from "@/integrations/supabase/client";
import { ScrapedCourse } from "../courseTypes";

// Function to check if a course can be updated
export const canUpdateCourse = async (courseId: string): Promise<boolean> => {
  try {
    const { data: progressData, error: progressError } = await supabase
      .from("user_course_progress")
      .select("*")
      .eq("course_id", courseId)
      .eq("status", "in_progress");
    
    if (progressError) {
      console.error("Error checking course progress:", progressError);
      return false;
    }
    
    if (!progressData || progressData.length === 0) {
      return true;
    }
    
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const { data: recentActivity, error: activityError } = await supabase
      .from("user_course_progress")
      .select("updated_at")
      .eq("course_id", courseId)
      .gt("updated_at", twoWeeksAgo.toISOString())
      .limit(1);
    
    if (activityError) {
      console.error("Error checking recent activity:", activityError);
      return false;
    }
    
    return !recentActivity || recentActivity.length === 0;
  } catch (error) {
    console.error("Error in canUpdateCourse:", error);
    return false;
  }
};

// Function to check for duplicate courses
export const checkDuplicateCourse = async (
  title: string, 
  source: string, 
  sourceUrl?: string
): Promise<{ isDuplicate: boolean; existingId?: string; confidence: number }> => {
  try {
    // Generate hash for duplicate detection
    const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, '');
    const normalizedSource = source.toLowerCase().trim();
    const courseHash = `${normalizedTitle}-${normalizedSource}`;
    
    // First check existing courses table by hash
    const { data: existingCourses, error: coursesError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("hash_identifier", courseHash)
      .limit(1);
    
    if (coursesError) {
      console.error("Error checking for duplicate in courses:", coursesError);
    } else if (existingCourses && existingCourses.length > 0) {
      return {
        isDuplicate: true,
        existingId: existingCourses[0].id,
        confidence: 100 // Exact match
      };
    }
    
    // If we have a source URL, check for matching URLs
    if (sourceUrl) {
      const { data: urlMatches, error: urlError } = await supabase
        .from("courses")
        .select("id, title")
        .or(`source_url.eq.${sourceUrl},external_link.eq.${sourceUrl},video_embed_url.eq.${sourceUrl}`)
        .limit(1);
      
      if (urlError) {
        console.error("Error checking URL duplicates:", urlError);
      } else if (urlMatches && urlMatches.length > 0) {
        return {
          isDuplicate: true,
          existingId: urlMatches[0].id,
          confidence: 90 // Very high confidence
        };
      }
    }
    
    // If we get here, it's likely not a duplicate
    return { isDuplicate: false, confidence: 0 };
  } catch (error) {
    console.error("Error in checkDuplicateCourse:", error);
    return { isDuplicate: false, confidence: 0 };
  }
};

// Function to sanitize scraped course data
export const sanitizeScrapedCourse = (course: Partial<ScrapedCourse>): ScrapedCourse => {
  // Ensure all required fields are present with default values
  return {
    id: course.id || '',
    title: course.title || 'Untitled Course',
    summary: course.summary || '',
    category: course.category || 'model',
    level: course.level || 'beginner',
    video_embed_url: course.video_embed_url || '',
    external_link: course.external_link || '',
    image_url: course.image_url || '',
    hosting_type: course.hosting_type || 'external',
    created_at: course.created_at || new Date().toISOString(),
    is_approved: course.is_approved ?? false,
    is_reviewed: course.is_reviewed ?? false,
    scraper_source: course.scraper_source || 'manual',
    hash_identifier: course.hash_identifier || '',
    review_notes: course.review_notes || '',
    source_id: course.source_id || '',
    is_duplicate: course.is_duplicate ?? false,
    duplicate_confidence: course.duplicate_confidence || 0,
    duplicate_of: course.duplicate_of || null
  };
};
