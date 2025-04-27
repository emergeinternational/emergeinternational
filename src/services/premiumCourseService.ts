import { supabase } from "@/integrations/supabase/client";
import { CourseCategory, CourseLevel, CourseHostingType } from "./courseTypes";

export interface PremiumCourse {
  id: string;
  title: string;
  summary?: string;
  category: CourseCategory;
  level: CourseLevel;
  hosting_type: CourseHostingType;
  image_path?: string;
  start_date?: string;
  end_date?: string;
  student_capacity: number;
  has_active_students: boolean;
  is_published: boolean;
  created_by?: string;
  created_at?: string;
}

export interface PremiumCourseEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  created_at: string;
  course?: PremiumCourse;
}

export interface PremiumEnrollment {
  id: string;
  course_id: string;
  user_id: string;
  last_activity_date: string;
  created_at: string;
  course?: PremiumCourse;
  user?: {
    email?: string;
    full_name?: string;
  };
}

export async function uploadPremiumCourseImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('premium_course_images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from('premium_course_images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadPremiumCourseImage:', error);
    return null;
  }
}

export async function createPremiumCourse(data: Omit<PremiumCourse, 'id' | 'has_active_students'>): Promise<string | null> {
  try {
    const { data: courseData, error } = await supabase
      .from('premium_courses')
      .insert([{
        ...data,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        student_capacity: data.student_capacity || 20,
        level: data.level || 'beginner'
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating premium course:', error);
      return null;
    }

    return courseData.id;
  } catch (error) {
    console.error('Error in createPremiumCourse:', error);
    return null;
  }
}

export async function listPublishedPremiumCourses(): Promise<PremiumCourse[]> {
  try {
    const { data, error } = await supabase
      .from('premium_courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching premium courses:', error);
      return [];
    }

    return data as PremiumCourse[];
  } catch (error) {
    console.error('Error in listPublishedPremiumCourses:', error);
    return [];
  }
}

export async function getUserEnrolledCourses(): Promise<PremiumCourseEnrollment[]> {
  try {
    const { data, error } = await supabase
      .from('premium_course_enrollments')
      .select(`
        *,
        course:premium_courses(*)
      `)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user enrolled courses:', error);
      return [];
    }

    return data as PremiumCourseEnrollment[];
  } catch (error) {
    console.error('Error in getUserEnrolledCourses:', error);
    return [];
  }
}

export async function enrollInPremiumCourse(courseId: string): Promise<boolean> {
  try {
    const isAlreadyEnrolled = await isUserEnrolled(courseId);
    if (isAlreadyEnrolled) {
      console.log('User already enrolled in this course');
      return true;
    }
    
    const { error } = await supabase
      .from('premium_course_enrollments')
      .insert([{
        course_id: courseId,
        user_id: (await supabase.auth.getUser()).data.user?.id
      }]);

    if (error) {
      console.error('Error enrolling in course:', error);
      return false;
    }

    await updateCourseActiveStudentsFlag(courseId);
    
    return true;
  } catch (error) {
    console.error('Error in enrollInPremiumCourse:', error);
    return false;
  }
}

export async function isUserEnrolled(courseId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('premium_course_enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking enrollment:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isUserEnrolled:', error);
    return false;
  }
}

export async function updateCourseActiveStudentsFlag(courseId: string): Promise<boolean> {
  try {
    const { count, error: countError } = await supabase
      .from('premium_course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);
    
    if (countError) {
      console.error('Error checking enrollments count:', countError);
      return false;
    }
    
    const { error: updateError } = await supabase
      .from('premium_courses')
      .update({ has_active_students: count > 0 })
      .eq('id', courseId);
      
    if (updateError) {
      console.error('Error updating course has_active_students flag:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateCourseActiveStudentsFlag:', error);
    return false;
  }
}

/**
 * Triggers the generation of course expiration notifications
 * @param courseId Optional course ID to generate notifications only for a specific course (useful for testing)
 * @returns Object containing success status and any response data
 */
export async function triggerExpirationNotifications(courseId?: string): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> {
  try {
    console.log('Triggering course expiration notifications' + 
      (courseId ? ` for course ID: ${courseId}` : ''));
    
    const payload = courseId ? { course_id: courseId } : {};
    const { data, error } = await supabase.functions.invoke(
      'generate-course-expiration-notifications',
      {
        method: 'POST',
        body: payload
      }
    );
    
    if (error) {
      console.error('Error triggering expiration notifications:', error);
      return { 
        success: false, 
        error: error.message || 'Unknown error'
      };
    }
    
    console.log('Expiration notifications triggered successfully:', data);
    return { 
      success: true, 
      data 
    };
  } catch (error) {
    console.error('Error in triggerExpirationNotifications:', error);
    return { 
      success: false, 
      error: error.message || 'Unknown error'
    };
  }
}

export async function getAdminPremiumEnrollments({
  page = 1, 
  pageSize = 20, 
  courseTitle,
  activeFilter
}: {
  page?: number;
  pageSize?: number;
  courseTitle?: string;
  activeFilter?: 'active' | 'inactive';
}): Promise<{
  enrollments: PremiumEnrollment[];
  totalCount: number;
}> {
  try {
    let query = supabase
      .from('premium_course_enrollments')
      .select(`
        *,
        course:premium_courses(id, title),
        user:profiles(email, full_name)
      `, { count: 'exact' });

    if (courseTitle) {
      query = query.filter('course.title', 'ilike', `%${courseTitle}%`);
    }

    if (activeFilter === 'active') {
      query = query.gt('last_activity_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());
    } else if (activeFilter === 'inactive') {
      query = query.lte('last_activity_date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      enrollments: data as unknown as PremiumEnrollment[],
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error fetching premium enrollments:', error);
    return { enrollments: [], totalCount: 0 };
  }
}
