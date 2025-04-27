import { supabase } from "@/integrations/supabase/client";
import { Course, generateCourseHash } from "../courseTypes";

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

// Function to check if a course already exists in the database
export const checkDuplicateCourse = async (
  title: string, 
  source_platform: string,
  source_url?: string
): Promise<{ isDuplicate: boolean; existingCourseId?: string; confidence: number }> => {
  try {
    // Generate hash for the course being checked
    const courseHash = generateCourseHash(title, source_platform);
    
    // First check by hash (most accurate)
    const { data: hashMatches, error: hashError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("hash_identifier", courseHash)
      .limit(1);
    
    if (hashError) {
      console.error("Error checking course by hash:", hashError);
    } else if (hashMatches && hashMatches.length > 0) {
      return { 
        isDuplicate: true, 
        existingCourseId: hashMatches[0].id,
        confidence: 100 // Perfect match
      };
    }
    
    // If no hash match, check by source URL if available
    if (source_url) {
      const { data: urlMatches, error: urlError } = await supabase
        .from("courses")
        .select("id, title")
        .eq("source_url", source_url)
        .limit(1);
      
      if (urlError) {
        console.error("Error checking course by URL:", urlError);
      } else if (urlMatches && urlMatches.length > 0) {
        return { 
          isDuplicate: true, 
          existingCourseId: urlMatches[0].id,
          confidence: 95 // Very high confidence
        };
      }
    }
    
    // If still no match, check by title similarity
    const { data: titleMatches, error: titleError } = await supabase
      .from("courses")
      .select("id, title, source_platform")
      .ilike("title", `%${title.substring(0, Math.min(title.length, 10))}%`) // Look for partial title match
      .limit(5);
    
    if (titleError) {
      console.error("Error checking course by title:", titleError);
    } else if (titleMatches && titleMatches.length > 0) {
      // Find the closest match by comparing titles
      const closestMatch = titleMatches.reduce((closest, current) => {
        const closestSimilarity = calculateSimilarity(title, closest.title);
        const currentSimilarity = calculateSimilarity(title, current.title);
        
        return currentSimilarity > closestSimilarity ? current : closest;
      }, titleMatches[0]);
      
      const similarity = calculateSimilarity(title, closestMatch.title);
      
      if (similarity > 0.8 && closestMatch.source_platform === source_platform) {
        return {
          isDuplicate: true,
          existingCourseId: closestMatch.id,
          confidence: Math.round(similarity * 90) // Scale to 0-90 range
        };
      }
      
      if (similarity > 0.9) {
        return {
          isDuplicate: true,
          existingCourseId: closestMatch.id,
          confidence: Math.round(similarity * 80) // Scale to 0-80 range
        };
      }
    }
    
    // No duplicate found
    return { isDuplicate: false, confidence: 0 };
  } catch (error) {
    console.error("Error checking for duplicate course:", error);
    return { isDuplicate: false, confidence: 0 };
  }
};

// Helper function to calculate string similarity (0-1 range)
export const calculateSimilarity = (str1: string, str2: string): number => {
  const normalized1 = str1.toLowerCase().trim();
  const normalized2 = str2.toLowerCase().trim();
  
  if (normalized1 === normalized2) return 1; // Exact match
  if (normalized1.length === 0 || normalized2.length === 0) return 0;
  
  // Levenshtein distance algorithm
  const matrix: number[][] = [];
  
  // Initialize the matrix
  for (let i = 0; i <= normalized1.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= normalized2.length; j++) {
    matrix[0][j] = j;
  }
  
  // Fill the matrix
  for (let i = 1; i <= normalized1.length; i++) {
    for (let j = 1; j <= normalized2.length; j++) {
      const cost = normalized1.charAt(i - 1) === normalized2.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // Deletion
        matrix[i][j - 1] + 1,      // Insertion
        matrix[i - 1][j - 1] + cost  // Substitution
      );
    }
  }
  
  // Calculate the similarity
  const distance = matrix[normalized1.length][normalized2.length];
  const maxLength = Math.max(normalized1.length, normalized2.length);
  
  return maxLength > 0 ? 1 - distance / maxLength : 1;
};
