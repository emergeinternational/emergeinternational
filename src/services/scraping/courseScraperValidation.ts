
import { supabase } from "@/integrations/supabase/client";
import { ScrapedCourse, generateCourseHash } from "../courseTypes";

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

// Check if a course is a duplicate
export const checkDuplicateCourse = async (course: ScrapedCourse): Promise<{ 
  isDuplicate: boolean; 
  confidence: number; 
  duplicateId?: string 
}> => {
  try {
    if (!course.title) {
      return { isDuplicate: false, confidence: 0 };
    }
    
    const hash = generateCourseHash(course);
    
    // Check for exact match by hash
    const { data: exactMatch, error: exactMatchError } = await supabase
      .from("scraped_courses")
      .select("id, title")
      .eq("hash_identifier", hash)
      .neq("id", course.id || '')
      .limit(1)
      .maybeSingle();
    
    if (exactMatchError) {
      console.error("Error checking for exact match:", exactMatchError);
    }
    
    if (exactMatch) {
      return { 
        isDuplicate: true, 
        confidence: 100, 
        duplicateId: exactMatch.id 
      };
    }
    
    // Check by title similarity
    const normalizedTitle = course.title.toLowerCase().trim();
    const { data: similarTitles, error: similarTitlesError } = await supabase
      .from("scraped_courses")
      .select("id, title")
      .neq("id", course.id || '');
    
    if (similarTitlesError) {
      console.error("Error checking for similar titles:", similarTitlesError);
      return { isDuplicate: false, confidence: 0 };
    }
    
    // Simple similarity check (in a real app, you'd use a more sophisticated algorithm)
    const similarCourse = similarTitles?.find(c => {
      if (!c.title) return false;
      const otherTitle = c.title.toLowerCase().trim();
      
      // Check if one title contains the other
      if (normalizedTitle.includes(otherTitle) || otherTitle.includes(normalizedTitle)) {
        return true;
      }
      
      // Check for word overlap
      const words1 = normalizedTitle.split(/\s+/);
      const words2 = otherTitle.split(/\s+/);
      const commonWords = words1.filter(word => words2.includes(word));
      
      // If more than 70% of words match, consider it similar
      return commonWords.length / Math.max(words1.length, words2.length) > 0.7;
    });
    
    if (similarCourse) {
      return { 
        isDuplicate: true, 
        confidence: 90, 
        duplicateId: similarCourse.id 
      };
    }
    
    return { isDuplicate: false, confidence: 0 };
  } catch (error) {
    console.error("Error in checkDuplicateCourse:", error);
    return { isDuplicate: false, confidence: 0 };
  }
};

export const sanitizeScrapedCourse = (data: any): ScrapedCourse => {
  return {
    id: data.id,
    title: data.title,
    summary: data.summary || '',
    category: data.category,
    level: data.level || 'beginner',
    hosting_type: data.hosting_type || 'external',
    external_link: data.external_link || '',
    image_url: data.image_url || '',
    video_embed_url: data.video_embed_url || '',
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_approved: !!data.is_approved,
    is_reviewed: !!data.is_reviewed,
    review_notes: data.review_notes || '',
    scraper_source: data.scraper_source || 'manual',
    hash_identifier: data.hash_identifier || '',
    is_duplicate: !!data.is_duplicate,
    duplicate_confidence: data.duplicate_confidence || 0,
    duplicate_of: data.duplicate_of || ''
  };
};
