
import { 
  ScrapedCourse, 
  CourseCategory, 
  CourseLevel, 
  HostingType,
  sanitizeScrapedCourse 
} from '../courseTypes';
import { supabase } from '@/integrations/supabase/client';

// Simple type definition for the simplified course
type SimplifiedCourse = {
  title: string;
  category: CourseCategory;
  external_link?: string;
  hosting_type: HostingType;
  level?: CourseLevel;
  [key: string]: any;
};

// Process scraped data
const processScrapedData = (data: SimplifiedCourse[]): SimplifiedCourse[] => {
  // Implementation here
  return data;
};

// Get pending scraped courses
export async function getPendingScrapedCourses() {
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
    
    return { success: true };
  } catch (error) {
    console.error('Error rejecting course:', error);
    return { success: false, error };
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

// Get duplicate stats
export async function getDuplicateStats() {
  try {
    const { data, error } = await supabase
      .from('scraped_courses')
      .select('is_duplicate')
      .eq('is_duplicate', true);
    
    if (error) throw error;
    
    return { 
      duplicateCount: data?.length || 0,
      success: true
    };
  } catch (error) {
    console.error('Error getting duplicate stats:', error);
    return { success: false, duplicateCount: 0, error };
  }
}
