import { supabase } from "@/integrations/supabase/client";
import { ScrapedCourse, sanitizeScrapedCourse } from "../courseTypes";
import { checkDuplicateCourse } from "./courseScraperValidation";

// Fixed to handle the proper types
export async function submitScrapedCourse(courseData: Omit<ScrapedCourse, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
  try {
    // Cast the category and level to ensure compatibility with the database types
    const { error } = await supabase
      .from('scraped_courses')
      .insert({
        title: courseData.title,
        summary: courseData.summary,
        category: courseData.category,
        hosting_type: courseData.hosting_type,
        external_link: courseData.external_link,
        image_url: courseData.image_url,
        video_embed_url: courseData.video_embed_url,
        is_approved: false,
        is_reviewed: false,
        review_notes: courseData.review_notes,
        scraper_source: courseData.scraper_source,
        level: courseData.level || 'beginner'
      });

    if (error) {
      console.error('Error submitting scraped course:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in submitScrapedCourse:', error);
    return false;
  }
}

export async function getPendingScrapedCourses(): Promise<ScrapedCourse[]> {
  try {
    const { data, error } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending scraped courses:', error);
      return [];
    }

    return (data || []).map(sanitizeScrapedCourse);
  } catch (error) {
    console.error('Error in getPendingScrapedCourses:', error);
    return [];
  }
}

export async function approveScrapedCourse(courseId: string): Promise<boolean> {
  try {
    const { data: courseData, error: courseError } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (courseError) {
      console.error('Error fetching scraped course:', courseError);
      return false;
    }

    if (!courseData) {
      console.warn('Scraped course not found with ID:', courseId);
      return false;
    }

    const isDuplicate = await checkDuplicateCourse(courseData as ScrapedCourse);

    if (isDuplicate) {
      console.warn('Skipping approval due to potential duplicate:', courseData.title);
      return false;
    }

    const { error } = await supabase
      .from('scraped_courses')
      .update({ is_approved: true })
      .eq('id', courseId);

    if (error) {
      console.error('Error approving scraped course:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in approveScrapedCourse:', error);
    return false;
  }
}

export async function rejectScrapedCourse(courseId: string, reviewNotes: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('scraped_courses')
      .update({ is_reviewed: true, review_notes: reviewNotes })
      .eq('id', courseId);

    if (error) {
      console.error('Error rejecting scraped course:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in rejectScrapedCourse:', error);
    return false;
  }
}

// Fix the getScrapedCoursesBySource function to properly type the return value
export async function getScrapedCoursesBySource(source: string): Promise<ScrapedCourse[]> {
  try {
    const { data, error } = await supabase
      .from('scraped_courses')
      .select('*')
      .eq('scraper_source', source)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scraped courses by source:', error);
      return [];
    }

    return (data || []).map(sanitizeScrapedCourse);
  } catch (error) {
    console.error('Error in getScrapedCoursesBySource:', error);
    return [];
  }
}

export async function getDuplicateStats(): Promise<{
  totalDuplicates: number;
  totalCourses: number;
}> {
  try {
    const { count: totalDuplicates, error: duplicateError } = await supabase
      .from('scraped_courses')
      .select('*', { count: 'exact', head: true })
      .eq('is_duplicate', true);

    if (duplicateError) {
      console.error('Error fetching total duplicates count:', duplicateError);
      throw duplicateError;
    }

    const { count: totalCourses, error: coursesError } = await supabase
      .from('scraped_courses')
      .select('*', { count: 'exact', head: true });

    if (coursesError) {
      console.error('Error fetching total courses count:', coursesError);
      throw coursesError;
    }

    return {
      totalDuplicates: totalDuplicates || 0,
      totalCourses: totalCourses || 0,
    };
  } catch (error) {
    console.error('Error in getDuplicateStats:', error);
    return { totalDuplicates: 0, totalCourses: 0 };
  }
}

export async function triggerManualScrape(scraperName: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log(`Triggering manual scrape for scraper: ${scraperName}`);

    const { data, error } = await supabase.functions.invoke(
      'run-scraper',
      {
        method: 'POST',
        body: { name: scraperName }
      }
    );

    if (error) {
      console.error('Error triggering manual scrape:', error);
      return {
        success: false,
        error: error.message || 'Unknown error'
      };
    }

    console.log('Manual scrape triggered successfully:', data);
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error in triggerManualScrape:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}
