
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

export const getCourses = async (
  level?: string, 
  category?: string
): Promise<Course[]> => {
  try {
    let query = supabase.from('courses').select('*');

    if (level) {
      query = query.eq('level', level);
    }

    if (category) {
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
