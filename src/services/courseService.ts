
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseCategory, UserCourseEnrollment } from '@/types/education';

export const getCourseCategories = async (): Promise<CourseCategory[]> => {
  const { data, error } = await supabase
    .from('course_categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
};

export const getCourses = async (
  categoryId?: string,
  level?: string,
  searchQuery?: string
): Promise<Course[]> => {
  let query = supabase
    .from('courses')
    .select('*')
    .eq('status', 'published');
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  if (level) {
    query = query.eq('level', level);
  }
  
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }
  
  const { data, error } = await query.order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const enrollInCourse = async (courseId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_course_enrollments')
    .insert([{ course_id: courseId }]);
  
  if (error) throw error;
};

export const getUserEnrollments = async (): Promise<UserCourseEnrollment[]> => {
  const { data, error } = await supabase
    .from('user_course_enrollments')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const updateCourseProgress = async (
  enrollmentId: string,
  progress: number,
  lastPosition?: string
): Promise<void> => {
  const { error } = await supabase
    .from('user_course_enrollments')
    .update({
      progress_percent: progress,
      last_position: lastPosition,
      status: progress === 100 ? 'completed' : 'in_progress'
    })
    .eq('id', enrollmentId);
  
  if (error) throw error;
};
