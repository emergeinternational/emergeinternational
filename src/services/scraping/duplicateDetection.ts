import { supabase } from "@/integrations/supabase/client";
import { generateCourseHash } from "../courseTypes";
import { calculateSimilarity } from "./courseScraperValidation";
import { logScraperActivity } from "./courseScraperHelpers";

// Check if a course already exists in the database
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
      .from("scraped_courses")
      .select("id, title, scraper_source")
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
        .from("scraped_courses")
        .select("id, title, scraper_source")
        .or(`external_link.eq.${source_url},video_embed_url.eq.${source_url}`)
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
      .from("scraped_courses")
      .select("id, title, scraper_source")
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
      
      // If high confidence match with same source platform
      if (similarity > 0.8 && closestMatch.scraper_source === source_platform) {
        return {
          isDuplicate: true,
          existingCourseId: closestMatch.id,
          confidence: Math.round(similarity * 90) // Scale to 0-90 range
        };
      }
      
      // If very high confidence match regardless of source
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

// Log and handle duplicate course detection
export const handleDuplicateDetection = async (
  courseId: string,
  title: string,
  source: string,
  isDuplicate: boolean,
  existingCourseId: string | undefined,
  confidence: number
): Promise<void> => {
  if (isDuplicate) {
    await logScraperActivity(
      source,
      "duplicate_detected",
      confidence >= 90 ? "warning" : "success",
      { 
        scrapedCourseId: courseId, 
        existingCourseId,
        confidence,
        title
      }
    );
  }
};

// Get duplicate detection statistics
export const getDuplicateStats = async (): Promise<{
  totalScraped: number;
  duplicatesDetected: number;
  duplicatesBySource: Record<string, number>;
}> => {
  try {
    // Get total scraped courses
    const { count: totalCount, error: totalError } = await supabase
      .from("scraped_courses")
      .select("*", { count: 'exact', head: true });
    
    // Get duplicates count
    const { count: duplicateCount, error: duplicateError } = await supabase
      .from("scraped_courses")
      .select("*", { count: 'exact', head: true })
      .eq("is_duplicate", true);
    
    // Get duplicates by source
    const { data: duplicatesBySource, error: sourceError } = await supabase
      .from("scraped_courses")
      .select("scraper_source")
      .eq("is_duplicate", true);
    
    if (totalError || duplicateError || sourceError) {
      console.error("Error getting duplicate stats:", { totalError, duplicateError, sourceError });
      return { totalScraped: 0, duplicatesDetected: 0, duplicatesBySource: {} };
    }
    
    // Count duplicates by source
    const sourceCount: Record<string, number> = {};
    if (duplicatesBySource) {
      duplicatesBySource.forEach(course => {
        const source = course.scraper_source;
        if (source) {
          sourceCount[source] = (sourceCount[source] || 0) + 1;
        }
      });
    }
    
    return {
      totalScraped: totalCount || 0,
      duplicatesDetected: duplicateCount || 0,
      duplicatesBySource: sourceCount
    };
  } catch (error) {
    console.error("Error in getDuplicateStats:", error);
    return { totalScraped: 0, duplicatesDetected: 0, duplicatesBySource: {} };
  }
};
