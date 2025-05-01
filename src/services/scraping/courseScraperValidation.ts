
import { supabase } from "@/integrations/supabase/client";
import { ScrapedCourse, generateCourseHash } from "../courseTypes";

// Function to check if a course can be updated
export const validateCourseUpdate = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('id', courseId)
      .single();
      
    if (error) {
      throw new Error(`Error validating course: ${error.message}`);
    }
    
    return { 
      canUpdate: true,
      course: data
    };
  } catch (error) {
    console.error('Error in validateCourseUpdate:', error);
    return { 
      canUpdate: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Function to sanitize scraped course data
export const sanitizeScrapedCourse = (course: any): ScrapedCourse => {
  return {
    id: course.id || undefined,
    title: course.title || '',
    summary: course.summary || '',
    category: course.category || 'development',
    hosting_type: course.hosting_type || 'external',
    external_link: course.external_link || '',
    image_url: course.image_url || '',
    video_embed_url: course.video_embed_url || '',
    created_at: course.created_at || new Date().toISOString(),
    updated_at: course.updated_at || new Date().toISOString(),
    is_approved: typeof course.is_approved === 'boolean' ? course.is_approved : false,
    is_reviewed: typeof course.is_reviewed === 'boolean' ? course.is_reviewed : false,
    review_notes: course.review_notes || '',
    scraper_source: course.scraper_source || 'manual',
    level: course.level || 'beginner',
    hash_identifier: course.hash_identifier || generateCourseHash(course),
    is_duplicate: typeof course.is_duplicate === 'boolean' ? course.is_duplicate : false,
    duplicate_confidence: course.duplicate_confidence || 0,
    duplicate_of: course.duplicate_of || ''
  };
};
