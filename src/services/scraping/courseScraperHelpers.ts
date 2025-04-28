
import { ScrapedCourse, Course } from "../courseTypes";
import { supabase } from "@/integrations/supabase/client";

// Helper to sanitize scraped course data
export const sanitizeScrapedCourse = (courseData: any): ScrapedCourse => {
  return {
    ...courseData,
    title: courseData.title?.trim() || '',
    summary: courseData.summary?.trim(),
    external_link: courseData.external_link?.trim(),
    image_url: courseData.image_url?.trim(),
    video_embed_url: courseData.video_embed_url?.trim(),
    hash_identifier: courseData.hash_identifier || generateCourseHash(courseData),
    is_reviewed: courseData.is_reviewed === undefined ? false : courseData.is_reviewed,
    is_approved: courseData.is_approved === undefined ? false : courseData.is_approved
  };
};

// Generate a hash identifier for a course based on its title and source
export const generateCourseHash = (course: Partial<ScrapedCourse>): string => {
  const titleHash = course.title ? course.title.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const sourceHash = course.scraper_source ? course.scraper_source.toLowerCase() : '';
  return `${titleHash}-${sourceHash}`;
};

// Log scraper activity for monitoring
export const logScraperActivity = async (activity: string, details: any = {}) => {
  try {
    await supabase
      .from('automation_logs')
      .insert({
        function_name: 'course-scraper',
        results: { activity, ...details }
      });
      
    return true;
  } catch (error) {
    console.error('Error logging scraper activity:', error);
    return false;
  }
};

// Convert a scraped course to a verified course for insertion
export const createVerifiedCourse = (scrapedCourse: ScrapedCourse): Partial<Course> => {
  return {
    title: scrapedCourse.title,
    summary: scrapedCourse.summary,
    category: scrapedCourse.category,
    level: scrapedCourse.level,
    external_link: scrapedCourse.external_link,
    video_embed_url: scrapedCourse.video_embed_url,
    image_url: scrapedCourse.image_url,
    hosting_type: scrapedCourse.hosting_type,
    is_published: true
  };
};
