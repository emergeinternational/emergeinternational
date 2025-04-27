
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
