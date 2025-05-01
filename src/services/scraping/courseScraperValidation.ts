
import { ScrapedCourse } from "../courseTypes";
import { supabase } from "@/integrations/supabase/client";

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

// Check if a course is a potential duplicate of an existing course
export const checkDuplicateCourse = async (courseData: Partial<ScrapedCourse>): Promise<{
  isDuplicate: boolean;
  duplicateId?: string;
  confidence?: number;
}> => {
  try {
    if (!courseData.title) {
      return { isDuplicate: false };
    }
    
    // Check for exact title matches first
    const { data: exactMatches, error: exactError } = await supabase
      .from("courses")
      .select("id, title")
      .ilike("title", courseData.title)
      .limit(1);
    
    if (exactError) {
      console.error("Error checking for exact duplicates:", exactError);
    } else if (exactMatches && exactMatches.length > 0) {
      return {
        isDuplicate: true,
        duplicateId: exactMatches[0].id,
        confidence: 100
      };
    }
    
    // If no exact match, check for similar titles
    const titleWords = courseData.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    if (titleWords.length === 0) {
      return { isDuplicate: false };
    }
    
    // Build a query for partial matches
    let query = supabase
      .from("courses")
      .select("id, title");
    
    for (const word of titleWords.slice(0, 3)) { // Limit to first 3 meaningful words
      query = query.or(`title.ilike.%${word}%`);
    }
    
    const { data: similarMatches, error: similarError } = await query.limit(5);
    
    if (similarError) {
      console.error("Error checking for similar duplicates:", similarError);
      return { isDuplicate: false };
    }
    
    if (similarMatches && similarMatches.length > 0) {
      // Calculate similarity score
      const bestMatch = similarMatches.map(course => {
        const courseTitleWords = course.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const commonWords = titleWords.filter(w => courseTitleWords.includes(w));
        const similarity = commonWords.length / Math.max(titleWords.length, courseTitleWords.length);
        return { id: course.id, similarity: similarity * 100 };
      }).sort((a, b) => b.similarity - a.similarity)[0];
      
      if (bestMatch && bestMatch.similarity > 70) {
        return {
          isDuplicate: true,
          duplicateId: bestMatch.id,
          confidence: bestMatch.similarity
        };
      }
    }
    
    return { isDuplicate: false };
  } catch (error) {
    console.error("Error in checkDuplicateCourse:", error);
    return { isDuplicate: false };
  }
};

// Utility to sanitize scraped course data
export function sanitizeScrapedCourse(data: any): ScrapedCourse {
  return {
    id: data.id || '',
    title: data.title || '',
    summary: data.summary || '',
    category: data.category || 'model',
    level: data.level || 'beginner',
    image_url: data.image_url || '',
    video_embed_url: data.video_embed_url || '',
    external_link: data.external_link || '',
    hosting_type: data.hosting_type || 'hosted',
    is_approved: data.is_approved === true,
    is_reviewed: data.is_reviewed === true,
    review_notes: data.review_notes || '',
    created_at: data.created_at || '',
    updated_at: data.updated_at || '',
    scraper_source: data.scraper_source || 'manual',
    hash_identifier: data.hash_identifier || '',
    is_duplicate: data.is_duplicate === true,
    duplicate_confidence: data.duplicate_confidence || 0,
    duplicate_of: data.duplicate_of || '',
  };
}
