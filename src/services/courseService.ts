
import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  summary?: string;
  image_url?: string;
  video_embed_url?: string;
  external_link?: string;
  level: 'beginner' | 'intermediate' | 'expert';
  category: 'model' | 'designer' | 'photographer' | 'videographer' | 'musical_artist' | 'fine_artist' | 'event_planner';
  hosting_type: 'hosted' | 'embedded' | 'external';
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

// Add CourseProgress interface
export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  status: string;
  date_started: string;
  date_completed?: string;
}

export const getCourses = async (
  level?: string, 
  category?: string
): Promise<Course[]> => {
  try {
    let query = supabase.from('courses').select('*');

    if (level && level !== 'all') {
      query = query.eq('level', level);
    }

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching courses:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getCourses:', error);
    return [];
  }
};

// Add getCourseById function
export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching course by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getCourseById:', error);
    return null;
  }
};

// Add getCourseProgress function
export const getCourseProgress = async (courseId: string, userId: string): Promise<CourseProgress | null> => {
  try {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching course progress:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getCourseProgress:', error);
    return null;
  }
};

// Add trackCourseEngagement function
export const trackCourseEngagement = async (courseId: string): Promise<boolean> => {
  try {
    // First check if there's already an engagement record for this course
    const { data: existingData, error: checkError } = await supabase
      .from('course_engagement')
      .select('*')
      .eq('course_id', courseId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is expected if no engagement yet
      console.error('Error checking course engagement:', checkError);
      return false;
    }

    if (existingData) {
      // Update existing engagement record
      const { error: updateError } = await supabase
        .from('course_engagement')
        .update({ 
          total_clicks: (existingData.total_clicks || 0) + 1,
          last_click_date: new Date().toISOString()
        })
        .eq('course_id', courseId);

      if (updateError) {
        console.error('Error updating course engagement:', updateError);
        return false;
      }
    } else {
      // Create new engagement record
      const { error: insertError } = await supabase
        .from('course_engagement')
        .insert({
          course_id: courseId,
          total_clicks: 1,
          last_click_date: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error inserting course engagement:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in trackCourseEngagement:', error);
    return false;
  }
};

// Add functions for certificate management
export const getEligibleUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('certificate_eligibility')
      .select(`
        *,
        profiles:user_id(full_name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching eligible users:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error in getEligibleUsers:', error);
    return [];
  }
};

export const updateCertificateApproval = async (id: string, isApproved: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('certificate_eligibility')
      .update({ admin_approved: isApproved })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating certificate approval:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Unexpected error in updateCertificateApproval:', error);
    return false;
  }
};
