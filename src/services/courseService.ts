
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseCategory, UserCourseEnrollment } from '@/types/education';

export const getCourseCategories = async (): Promise<CourseCategory[]> => {
  const { data, error } = await supabase
    .from('education_categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  
  // Map the education_categories data to CourseCategory format
  return (data || []).map(category => ({
    id: category.id,
    name: category.name,
    slug: category.name.toLowerCase().replace(/\s+/g, '-'),
    description: category.description || undefined,
    icon: undefined
  }));
};

export const getCourses = async (
  categoryId?: string,
  level?: string,
  searchQuery?: string
): Promise<Course[]> => {
  let query = supabase
    .from('education_content')
    .select('*')
    .eq('is_archived', false);
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  // We can't filter by level in the existing structure, so we'll do that client-side

  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }
  
  const { data, error } = await query.order('published_at', { ascending: false });
  
  if (error) throw error;
  
  // Map the education_content data to Course format
  // Since level might not exist in the original data, we'll assign a default
  return (data || []).map(content => ({
    id: content.id,
    title: content.title,
    slug: content.title.toLowerCase().replace(/\s+/g, '-'),
    overview: content.summary || '',
    description: content.summary,
    categoryId: content.category_id || '',
    // Assign a default level if needed - we'll allow filtering by this on the client side
    level: (level as any) || 'beginner',
    source: content.source_url ? 'external' : 'internal',
    externalUrl: content.source_url,
    thumbnailUrl: content.image_url,
    videoUrl: undefined,
    content: undefined,
    durationMinutes: undefined,
    status: content.is_archived ? 'archived' : 'published',
    featured: content.is_featured,
    language: 'en'
  }));
};

export const enrollInCourse = async (courseId: string): Promise<void> => {
  // Use the user_course_progress table which seems to be the equivalent
  const { error } = await supabase
    .from('user_course_progress')
    .insert([{ 
      course_id: courseId,
      status: 'not_started',
      date_started: new Date().toISOString()
    }]);
  
  if (error) throw error;
};

export const getUserEnrollments = async (): Promise<UserCourseEnrollment[]> => {
  const { data, error } = await supabase
    .from('user_course_progress')
    .select('*')
    .order('date_started', { ascending: false });
  
  if (error) throw error;
  
  // Map the user_course_progress data to UserCourseEnrollment format
  return (data || []).map(progress => ({
    id: progress.id,
    userId: progress.user_id,
    courseId: progress.course_id,
    status: progress.status as any || 'not_started',
    progressPercent: 0, // We don't have this information in the current schema
    lastPosition: undefined,
    startedAt: progress.date_started || new Date().toISOString(),
    completedAt: progress.date_completed
  }));
};

export const updateCourseProgress = async (
  enrollmentId: string,
  progress: number,
  lastPosition?: string
): Promise<void> => {
  const { error } = await supabase
    .from('user_course_progress')
    .update({
      status: progress === 100 ? 'completed' : 'in_progress',
      date_completed: progress === 100 ? new Date().toISOString() : null
    })
    .eq('id', enrollmentId);
  
  if (error) throw error;
};
