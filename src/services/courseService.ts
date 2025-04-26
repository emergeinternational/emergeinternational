
import { supabase } from '@/integrations/supabase/client';
import { Course, CourseCategory, UserCourseEnrollment, EducationLevel, Certificate, Language } from '@/types/education';

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
    slug: content.title.toLowerCase().replace(/\s+/g, '-'),
    overview: content.summary || '',
    description: content.description || content.summary || '',
    categoryId: content.category_id || '',
    level: content.level || 'beginner',
    source: content.source_type || 'external',
    externalUrl: content.source_url,
    thumbnailUrl: content.image_url,
    videoUrl: content.video_url,
    content: content.content,
    durationMinutes: content.duration_minutes,
    status: content.is_archived ? 'archived' : 'published',
    featured: content.is_featured,
    language: content.language || 'en'
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
    status: progress.status as CompletionStatus || 'not_started',
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
    await supabase.functions.invoke('education-automation', {
      body: { operation: 'generate-certificates' }
    });
  }
};

// Get user certificates
export const getUserCertificates = async (): Promise<Certificate[]> => {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error('User must be authenticated');
  
  const { data, error } = await supabase
    .from('user_certificates')
    .select(`
      *,
      education_content(title),
      education_categories(name)
    `)
    .eq('user_id', user.id)
    .order('issue_date', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(cert => {
    const title = cert.certificate_type === 'course' 
      ? `${cert.education_content?.title || 'Course'} Certificate` 
      : `${cert.education_categories?.name || 'Category'} Mastery Certificate`;
      
    return {
      id: cert.id,
      userId: cert.user_id,
      courseId: cert.course_id,
      categoryId: cert.category_id,
      issueDate: cert.issue_date,
      type: cert.certificate_type,
      title: title,
      downloadUrl: `/api/certificates/${cert.id}`
    };
  });
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
      last_click_date: new Date().toISOString()
    }, { onConflict: 'course_id' });
  } catch (e) {
    console.error('Failed to track engagement', e);
  }
  
  return data;
};
