
import { 
  ScrapedCourse, 
  CourseCategory, 
  CourseLevel, 
  HostingType
} from '../courseTypes';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeScrapedCourse } from './courseScraperValidation';

// Process scraped data
const processScrapedData = (data: any[]): any[] => {
  // Implementation here
  return data;
};

// Get pending scraped courses
export async function getPendingScrapedCourses(): Promise<ScrapedCourse[]> {
  try {
    const { data, error } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('is_reviewed', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data?.map(course => sanitizeScrapedCourse(course)) || [];
  } catch (error) {
    console.error('Error fetching pending scraped courses:', error);
    return [];
  }
}

// Approve a scraped course
export async function approveScrapedCourse(courseId: string) {
  try {
    const { error } = await supabase
      .from('scraped_courses')
      .update({ is_reviewed: true, is_approved: true })
      .eq('id', courseId);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error approving course:', error);
    return { success: false, error };
  }
}

// Reject a scraped course
export async function rejectScrapedCourse(courseId: string, notes: string) {
  try {
    const { error } = await supabase
      .from('scraped_courses')
      .update({ 
        is_reviewed: true, 
        is_approved: false,
        review_notes: notes
      })
      .eq('id', courseId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error rejecting course:', error);
    return false;
  }
}

// Check for duplicates
export async function checkDuplicateCourse(title: string, externalLink?: string): Promise<{ isDuplicate: boolean, duplicateId?: string, confidence: number }> {
  try {
    // Basic implementation - could be enhanced with fuzzy matching algorithms
    const { data, error } = await supabase
      .from('courses')
      .select('id, title')
      .ilike('title', `%${title}%`)
      .limit(1);
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      // Simple string similarity check
      const similarity = calculateTitleSimilarity(title, data[0].title);
      return { 
        isDuplicate: similarity > 0.8,
        duplicateId: data[0].id,
        confidence: similarity * 100
      };
    }
    
    return { isDuplicate: false, confidence: 0 };
  } catch (error) {
    console.error('Error checking for duplicate course:', error);
    return { isDuplicate: false, confidence: 0 };
  }
}

// Simple title similarity helper
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

// Get duplicate stats
export async function getDuplicateStats() {
  try {
    const { data, error } = await supabase
      .from('scraped_courses')
      .select('is_duplicate, scraper_source')
      .eq('is_duplicate', true);
    
    if (error) throw error;
    
    const duplicatesBySource: Record<string, number> = {};
    
    data?.forEach(course => {
      const source = course.scraper_source || 'unknown';
      duplicatesBySource[source] = (duplicatesBySource[source] || 0) + 1;
    });
    
    return { 
      totalScraped: data?.length || 0,
      duplicatesDetected: data?.filter(c => c.is_duplicate).length || 0,
      duplicatesBySource
    };
  } catch (error) {
    console.error('Error getting duplicate stats:', error);
    return { 
      totalScraped: 0,
      duplicatesDetected: 0,
      duplicatesBySource: {}
    };
  }
}

// Trigger manual scrape
export async function triggerManualScrape() {
  try {
    // This would typically call an edge function or backend API
    // For demonstration purposes we'll just return a success message
    return { success: true, message: 'Manual scrape triggered' };
  } catch (error) {
    console.error('Error triggering manual scrape:', error);
    return { success: false, error };
  }
}
