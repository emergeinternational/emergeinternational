
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
    id: course.id || '',
    title: course.title || '',
    summary: course.summary || '',
    category: (course.category as any) || 'development',
    hosting_type: (course.hosting_type as any) || 'external',
    external_link: course.external_link || '',
    image_url: course.image_url || '',
    video_embed_url: course.video_embed_url || '',
    created_at: course.created_at || new Date().toISOString(),
    updated_at: course.updated_at || new Date().toISOString(),
    is_approved: typeof course.is_approved === 'boolean' ? course.is_approved : false,
    is_reviewed: typeof course.is_reviewed === 'boolean' ? course.is_reviewed : false,
    review_notes: course.review_notes || '',
    scraper_source: course.scraper_source || 'manual',
    level: (course.level as any) || 'beginner',
    hash_identifier: course.hash_identifier || generateCourseHash(course),
    is_duplicate: typeof course.is_duplicate === 'boolean' ? course.is_duplicate : false,
    duplicate_confidence: course.duplicate_confidence || 0,
    duplicate_of: course.duplicate_of || ''
  };
};

// Check for duplicate courses
export const checkDuplicateCourse = async (title: string, externalLink?: string): Promise<{ isDuplicate: boolean, confidence: number, duplicateId?: string }> => {
  try {
    // Implementation would typically use more sophisticated matching algorithms
    // For now, we'll just do a basic title similarity check
    const { data, error } = await supabase
      .from('courses')
      .select('id, title')
      .ilike('title', `%${title.substring(0, Math.min(title.length, 5))}%`)
      .limit(5);
    
    if (error) throw error;
    
    if (!data || data.length === 0) return { isDuplicate: false, confidence: 0 };
    
    // Find the most similar title
    let highestSimilarity = 0;
    let matchingCourse = null;
    
    for (const course of data) {
      const similarity = calculateTitleSimilarity(title, course.title);
      if (similarity > highestSimilarity) {
        highestSimilarity = similarity;
        matchingCourse = course;
      }
    }
    
    // Threshold for considering it a duplicate
    if (highestSimilarity > 0.8) {
      return { 
        isDuplicate: true,
        confidence: highestSimilarity * 100,
        duplicateId: matchingCourse?.id
      };
    }
    
    return { isDuplicate: false, confidence: highestSimilarity * 100 };
  } catch (error) {
    console.error('Error checking for duplicate course:', error);
    return { isDuplicate: false, confidence: 0 };
  }
};

// Simple title similarity function
function calculateTitleSimilarity(title1: string, title2: string): number {
  const t1 = title1.toLowerCase();
  const t2 = title2.toLowerCase();
  
  // Exact match
  if (t1 === t2) return 1.0;
  
  // One is substring of the other
  if (t1.includes(t2) || t2.includes(t1)) return 0.9;
  
  // Count matching words
  const words1 = t1.split(/\s+/);
  const words2 = t2.split(/\s+/);
  
  let matches = 0;
  for (const w1 of words1) {
    if (w1.length < 3) continue; // Skip short words
    if (words2.includes(w1)) matches++;
  }
  
  const similarity = matches / Math.max(words1.length, words2.length);
  return similarity;
}

// Function to check if a course can be updated
export const canUpdateCourse = async (courseId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('id')
      .eq('course_id', courseId)
      .eq('status', 'in_progress')
      .limit(1);
    
    if (error) throw error;
    
    // If no one is taking the course, it can be updated
    if (!data || data.length === 0) return true;
    
    // Check if there's recent activity on the course
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const { data: recentActivity, error: activityError } = await supabase
      .from('user_course_progress')
      .select('id')
      .eq('course_id', courseId)
      .gt('updated_at', twoWeeksAgo.toISOString())
      .limit(1);
    
    if (activityError) throw activityError;
    
    // If no recent activity, we can update despite people taking it
    return !recentActivity || recentActivity.length === 0;
  } catch (error) {
    console.error('Error in canUpdateCourse:', error);
    return false;
  }
};
