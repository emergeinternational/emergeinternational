
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseCategory, UserCourseEnrollment, EducationLevel, Certificate, Language, CompletionStatus } from '@/types/education';

// Get all course categories
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

// Get courses with filtering options
export const getCourses = async (
  categoryId?: string,
  level?: EducationLevel,
  language?: Language,
  searchQuery?: string
): Promise<Course[]> => {
  let query = supabase
    .from('education_content')
    .select('*')
    .eq('is_archived', false);
  
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  if (level) {
    query = query.eq('level', level);
  }
  
  if (language) {
    query = query.eq('language', language);
  }
  
  if (searchQuery) {
    query = query.ilike('title', `%${searchQuery}%`);
  }
  
  const { data, error } = await query.order('published_at', { ascending: false });
  
  if (error) throw error;
  
  // Map the education_content data to Course format
  return (data || []).map(content => ({
    id: content.id,
    title: content.title,
    slug: content.title?.toLowerCase().replace(/\s+/g, '-') || '',
    overview: content.summary || '',
    description: content.description || content.summary || '',
    categoryId: content.category_id || '',
    level: (content.level as EducationLevel) || 'beginner',
    source: (content.source_type as CourseSource) || 'external',
    externalUrl: content.source_url,
    thumbnailUrl: content.image_url,
    videoUrl: content.video_url,
    content: content.content,
    durationMinutes: content.duration_minutes,
    status: content.is_archived ? 'archived' : 'published',
    featured: content.is_featured || false,
    language: (content.language as Language) || 'en'
  }));
};

// Enroll user in a course
export const enrollInCourse = async (courseId: string): Promise<void> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User must be authenticated to enroll');
  
  const { error } = await supabase
    .from('user_course_progress')
    .insert({
      course_id: courseId,
      status: 'not_started',
      progress_percent: 0,
      date_started: new Date().toISOString(),
      user_id: user.id
    });
  
  if (error) throw error;
};

// Get user's enrolled courses
export const getUserEnrollments = async (): Promise<UserCourseEnrollment[]> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User must be authenticated');
  
  const { data, error } = await supabase
    .from('user_course_progress')
    .select('*, education_content(title, category_id, level)')
    .eq('user_id', user.id)
    .order('date_started', { ascending: false });
  
  if (error) throw error;
  
  // Map the user_course_progress data to UserCourseEnrollment format
  return (data || []).map(progress => ({
    id: progress.id,
    userId: progress.user_id,
    courseId: progress.course_id,
    status: (progress.status as CompletionStatus) || 'not_started',
    progressPercent: progress.progress_percent || 0,
    lastPosition: progress.last_position,
    startedAt: progress.date_started || new Date().toISOString(),
    completedAt: progress.date_completed,
    certificateId: progress.certificate_id
  }));
};

// Update course progress
export const updateCourseProgress = async (
  enrollmentId: string,
  progressPercent: number,
  lastPosition?: string
): Promise<void> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User must be authenticated');
  
  const updateData: any = {
    progress_percent: progressPercent,
    status: progressPercent === 100 ? 'completed' : 'in_progress'
  };
  
  if (lastPosition) {
    updateData.last_position = lastPosition;
  }
  
  if (progressPercent === 100) {
    updateData.date_completed = new Date().toISOString();
  }
  
  const { error } = await supabase
    .from('user_course_progress')
    .update(updateData)
    .eq('id', enrollmentId)
    .eq('user_id', user.id);
  
  if (error) throw error;
  
  // If course is completed, trigger certificate generation
  if (progressPercent === 100) {
    try {
      await supabase.functions.invoke('education-automation', {
        body: { operation: 'generate-certificates' }
      });
    } catch (e) {
      console.error('Failed to generate certificate:', e);
    }
  }
};

// Get user certificates
export const getUserCertificates = async (): Promise<Certificate[]> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User must be authenticated');
  
  // Since there's an issue with the user_certificates table, 
  // we'll use a different approach to get certificates
  // This is a temporary solution until the table structure is updated
  
  const { data: completedCourses, error: coursesError } = await supabase
    .from('user_course_progress')
    .select(`
      *,
      education_content(title, category_id, level)
    `)
    .eq('user_id', user.id)
    .eq('status', 'completed');
    
  if (coursesError) throw coursesError;
  
  // Create certificates based on completed courses
  const certificates: Certificate[] = (completedCourses || []).map(course => {
    return {
      id: course.id,
      userId: user.id,
      courseId: course.course_id,
      categoryId: course.education_content?.category_id,
      issueDate: course.date_completed || new Date().toISOString(),
      type: 'course',
      title: `${course.education_content?.title || 'Course'} Certificate`,
      downloadUrl: `/api/certificates/${course.id}`
    };
  });
  
  return certificates;
};

// Get course content
export const getCourseContent = async (courseId: string): Promise<any> => {
  const { data, error } = await supabase
    .from('education_content')
    .select('*')
    .eq('id', courseId)
    .single();
    
  if (error) throw error;
  
  // Track course engagement
  try {
    await supabase.from('course_engagement').upsert({
      course_id: courseId,
      last_click_date: new Date().toISOString(),
      total_clicks: 1
    }, { onConflict: 'course_id' });
  } catch (e) {
    console.error('Failed to track engagement', e);
  }
  
  return data;
};

// Check if user has completed all courses in a category
export const checkCategoryCompletion = async (categoryId: string): Promise<boolean> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return false;
  
  // Get all courses in the category
  const { data: categoryCourses, error: coursesError } = await supabase
    .from('education_content')
    .select('id')
    .eq('category_id', categoryId);
    
  if (coursesError || !categoryCourses || categoryCourses.length === 0) return false;
  
  // Get user's completed courses in this category
  const { data: userCompletedCourses, error: completedError } = await supabase
    .from('user_course_progress')
    .select('course_id')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .in('course_id', categoryCourses.map(c => c.id));
    
  if (completedError) return false;
  
  // Check if user completed all courses in the category
  return userCompletedCourses && userCompletedCourses.length === categoryCourses.length;
};

// Refresh course offerings function
export const refreshCourseOfferings = async (): Promise<void> => {
  // This would typically be called by a cron job every 2 weeks
  // The implementation depends on how you want to refresh the courses
  try {
    await supabase.functions.invoke('education-automation', {
      body: { operation: 'refresh-courses' }
    });
  } catch (e) {
    console.error('Failed to refresh courses:', e);
  }
};
