
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

// Function to sanitize a scraped course
export const sanitizeScrapedCourse = (course: any): ScrapedCourse => {
  // Ensure the course has all required properties
  return {
    id: course.id || '',
    title: course.title || '',
    summary: course.summary || '',
    category: course.category || 'model',
    level: course.level || 'beginner',
    video_embed_url: course.video_embed_url || '',
    external_link: course.external_link || '',
    image_url: course.image_url || '',
    hosting_type: course.hosting_type || 'external',
    is_approved: typeof course.is_approved === 'boolean' ? course.is_approved : false,
    is_reviewed: typeof course.is_reviewed === 'boolean' ? course.is_reviewed : false,
    created_at: course.created_at || new Date().toISOString(),
    scraper_source: course.scraper_source || 'manual',
    hash_identifier: course.hash_identifier || `manual-${Date.now()}`,
    review_notes: course.review_notes || ''
  };
};

// Function to check for duplicate courses
export const checkDuplicateCourse = async (title: string, source: string): Promise<boolean> => {
  try {
    // Generate a simple hash identifier from title and source
    const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, '');
    const normalizedSource = source.toLowerCase().trim();
    const hashIdentifier = `${normalizedTitle}-${normalizedSource}`;
    
    // Check in courses table
    const { data: existingCourses, error: coursesError } = await supabase
      .from("courses")
      .select("id")
      .eq("hash_identifier", hashIdentifier)
      .limit(1);
    
    if (coursesError) {
      console.error("Error checking for duplicate course:", coursesError);
      return false;
    }
    
    if (existingCourses && existingCourses.length > 0) {
      return true;
    }
    
    // Check in scraped_courses table
    const { data: scrapedCourses, error: scrapedError } = await supabase
      .from("scraped_courses")
      .select("id")
      .eq("hash_identifier", hashIdentifier)
      .eq("is_reviewed", true)
      .limit(1);
    
    if (scrapedError) {
      console.error("Error checking for scraped duplicate course:", scrapedError);
      return false;
    }
    
    return scrapedCourses && scrapedCourses.length > 0;
  } catch (error) {
    console.error("Error in checkDuplicateCourse:", error);
    return false;
  }
};
