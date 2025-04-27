
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

export async function createPremiumCourse(courseData: Omit<PremiumCourse, 'id' | 'has_active_students'>): Promise<string | null> {
  try {
    const { data: courseData, error } = await supabase
      .from('premium_courses')
      .insert([{
        ...courseData,
        created_by: (await supabase.auth.getUser()).data.user?.id,
        student_capacity: courseData.student_capacity || 20,
        level: courseData.level || 'beginner'
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
