
import { supabase } from '@/integrations/supabase/client';

export interface CourseFilters {
  category?: CourseCategory | CourseCategory[];
  hosted?: boolean;
  query?: string;
}

export interface CourseData {
  title: string;
  summary?: string;
  category: CourseCategory;
  hosting_type: CourseHostingType;
  image_url?: string;
  price?: number;
  external_link?: string;
  video_embed_url?: string;
  is_published: boolean;
}

export const fetchCourses = async (filters?: CourseFilters) => {
  try {
    let query = supabase.from('courses').select('*');

    if (filters) {
      if (filters.category) {
        if (Array.isArray(filters.category)) {
          query = query.in('category', filters.category);
        } else {
          query = query.eq('category', filters.category);
        }
      }

      if (filters.hosted !== undefined) {
        const hostingType = filters.hosted ? 'hosted' : 'external';
        query = query.eq('hosting_type', hostingType);
      }

      if (filters.query) {
        const searchTerm = `%${filters.query}%`;
        query = query.or(`title.ilike.${searchTerm},summary.ilike.${searchTerm}`);
      }
    }

    // Only fetch published courses
    query = query.eq('is_published', true);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }

    return data as Course[];
  } catch (error) {
    console.error('Error in fetchCourses:', error);
    throw error;
  }
};

export const fetchCourseById = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error(`Error fetching course with ID ${courseId}:`, error);
      throw error;
    }

    return data as Course;
  } catch (error) {
    console.error('Error in fetchCourseById:', error);
    throw error;
  }
};

export const trackCourseEngagement = async (courseId: string) => {
  try {
    // Check if engagement record exists for this course
    const { data, error } = await supabase
      .from('course_engagement')
      .select('*')
      .eq('course_id', courseId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking course engagement:', error);
      throw error;
    }

    if (data) {
      // Update existing engagement record
      const { error: updateError } = await supabase
        .from('course_engagement')
        .update({
          total_clicks: (data.total_clicks || 0) + 1,
          last_click_date: new Date().toISOString(),
        })
        .eq('id', data.id);

      if (updateError) {
        console.error('Error updating course engagement:', updateError);
        throw updateError;
      }
    } else {
      // Create new engagement record
      const { error: insertError } = await supabase
        .from('course_engagement')
        .insert({
          course_id: courseId,
          total_clicks: 1,
        });

      if (insertError) {
        console.error('Error inserting course engagement:', insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error in trackCourseEngagement:', error);
  }
};

export const fetchCoursesByCategory = async (category: CourseCategory) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('category', category as string)
      .eq('is_published', true);

    if (error) {
      console.error(`Error fetching courses with category ${category}:`, error);
      throw error;
    }

    return data as Course[];
  } catch (error) {
    console.error('Error in fetchCoursesByCategory:', error);
    throw error;
  }
};

export const updateCourse = async (id: string, courseData: Partial<Course>) => {
  try {
    // Cast types to strings as needed for Supabase
    const { error } = await supabase
      .from('courses')
      .update({
        ...courseData,
        category: courseData.category as string,
        hosting_type: courseData.hosting_type as string
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateCourse:', error);
    throw error;
  }
};

export const createCourse = async (courseData: CourseData) => {
  try {
    // Cast types to strings as needed for Supabase
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        summary: courseData.summary,
        category: courseData.category as string,
        hosting_type: courseData.hosting_type as string,
        image_url: courseData.image_url,
        price: courseData.price,
        external_link: courseData.external_link,
        video_embed_url: courseData.video_embed_url,
        is_published: courseData.is_published
      })
      .select();

    if (error) {
      console.error('Error creating course:', error);
      throw error;
    }

    return data?.[0] as Course;
  } catch (error) {
    console.error('Error in createCourse:', error);
    throw error;
  }
};

export const deleteCourse = async (id: string) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    throw error;
  }
};
