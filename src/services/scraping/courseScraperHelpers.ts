
import { supabase } from '@/integrations/supabase/client';

// Function to log scraper actions
export const logScraperAction = async (
  source: string,
  action: string,
  details?: any
) => {
  try {
    await supabase.from('automation_logs').insert({
      function_name: 'course_scraper',
      results: {
        source,
        action,
        details,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to log scraper action:', error);
  }
};

// Function to save a course from external source directly into courses table
export const saveDirectToCourse = async (courseData: {
  title: string;
  summary?: string;
  image?: string;
  link?: string;
  category: CourseCategory;
  level: CourseLevel;
  hosting_type: CourseHostingType;
  content?: string;
  [key: string]: any;
}) => {
  try {
    // Format data to match the courses table
    const formattedCourse = {
      title: courseData.title,
      summary: courseData.summary || '',
      image_url: courseData.image || null,
      external_link: courseData.link || null,
      category: courseData.category as string,
      level: courseData.level as string,
      hosting_type: courseData.hosting_type as string,
      is_published: true,
      created_at: new Date().toISOString(),
    };

    // Save to database
    const { data, error } = await supabase
      .from('courses')
      .insert(formattedCourse)
      .select('id');

    if (error) {
      console.error('Error saving course directly:', error);
      throw error;
    }

    return data?.[0]?.id;
  } catch (error) {
    console.error('Failed to save course directly:', error);
    throw error;
  }
};

// Parse URL parameters
export const parseUrlParams = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const params: Record<string, string> = {};

    parsedUrl.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    return params;
  } catch {
    return {};
  }
};

// Extract domain from URL
export const extractDomain = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch {
    return null;
  }
};

// Clean HTML content
export const cleanHtml = (html: string) => {
  if (!html) return '';

  // Remove script tags
  let cleaned = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove style tags
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML comments
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

  // Remove excessive whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
};

// Format date string to ISO
export const formatDateToIso = (dateString: string) => {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return date.toISOString();
  } catch {
    return null;
  }
};
