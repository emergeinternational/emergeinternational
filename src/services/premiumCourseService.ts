
import { supabase } from '@/integrations/supabase/client';

export interface PremiumCourseFilters {
  category?: string | string[];
  hasActiveStudents?: boolean;
}

export interface PremiumCourseData {
  title: string;
  summary?: string;
  category: CourseCategory;
  hosting_type: CourseHostingType;
  level: CourseLevel;
  image_path?: string;
  price?: number;
  start_date?: string;
  end_date?: string;
  student_capacity: number;
  is_published: boolean;
  has_active_students: boolean;
  created_by: string;
}

export const fetchPremiumCourses = async (filters?: PremiumCourseFilters) => {
  try {
    let query = supabase.from('premium_courses').select('*');

    if (filters) {
      if (filters.category) {
        if (Array.isArray(filters.category)) {
          query = query.in('category', filters.category);
        } else {
          query = query.eq('category', filters.category);
        }
      }

      if (filters.hasActiveStudents !== undefined) {
        query = query.eq('has_active_students', filters.hasActiveStudents);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching premium courses:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchPremiumCourses:', error);
    throw error;
  }
};

export const fetchPremiumCourseById = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('premium_courses')
      .select('*')
      .eq('id', courseId)
      .single();

    if (error) {
      console.error(`Error fetching premium course with ID ${courseId}:`, error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchPremiumCourseById:', error);
    throw error;
  }
};

export const createPremiumCourses = async (coursesData: PremiumCourseData[]) => {
  try {
    // Convert custom type enums to strings for database storage
    const coursesForDb = coursesData.map(course => ({
      ...course,
      category: course.category as string,
      level: course.level as string,
      hosting_type: course.hosting_type as string
    }));

    const { data, error } = await supabase
      .from('premium_courses')
      .insert(coursesForDb)
      .select();

    if (error) {
      console.error('Error creating premium courses:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createPremiumCourses:', error);
    throw error;
  }
};

export const updatePremiumCourse = async (id: string, courseData: Partial<PremiumCourseData>) => {
  try {
    // Handle enum types by converting to strings if they exist
    const courseForDb: Record<string, any> = { ...courseData };
    
    if (courseData.category) {
      courseForDb.category = courseData.category as string;
    }
    
    if (courseData.level) {
      courseForDb.level = courseData.level as string;
    }
    
    if (courseData.hosting_type) {
      courseForDb.hosting_type = courseData.hosting_type as string;
    }

    const { error } = await supabase
      .from('premium_courses')
      .update(courseForDb)
      .eq('id', id);

    if (error) {
      console.error('Error updating premium course:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updatePremiumCourse:', error);
    throw error;
  }
};

export const deletePremiumCourse = async (id: string) => {
  try {
    const { error } = await supabase
      .from('premium_courses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting premium course:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deletePremiumCourse:', error);
    throw error;
  }
};
