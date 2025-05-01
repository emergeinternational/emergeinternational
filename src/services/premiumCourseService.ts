
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

export interface PremiumCourse {
  id: string;
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
  created_at: string;
  updated_at?: string;
}

export interface PremiumCourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
  course?: PremiumCourse;
}

export interface PremiumEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  user_email?: string;
  user_name?: string;
  course_title?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at?: string;
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

// Function to create a single premium course
export const createPremiumCourse = async (courseData: PremiumCourseData) => {
  return createPremiumCourses([courseData]).then(data => data?.[0]);
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

// NEW FUNCTIONS BELOW

// Upload a premium course image to storage
export const uploadPremiumCourseImage = async (file: File, courseId: string) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${courseId}-${Date.now()}.${fileExt}`;
    const filePath = `premium_course_images/${fileName}`;

    const { error: uploadError } = await supabase
      .storage
      .from('course_images')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      throw uploadError;
    }

    const { data } = supabase
      .storage
      .from('course_images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadPremiumCourseImage:', error);
    throw error;
  }
};

// Get enrollments for a specific user
export const getUserEnrolledCourses = async () => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('premium_course_enrollments')
      .select(`
        *,
        course:premium_courses(*)
      `)
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user enrolled courses:', error);
      throw error;
    }

    return data as PremiumCourseEnrollment[];
  } catch (error) {
    console.error('Error in getUserEnrolledCourses:', error);
    throw error;
  }
};

// List all published premium courses
export const listPublishedPremiumCourses = async () => {
  try {
    const { data, error } = await supabase
      .from('premium_courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching published premium courses:', error);
      throw error;
    }

    return data as PremiumCourse[];
  } catch (error) {
    console.error('Error in listPublishedPremiumCourses:', error);
    throw error;
  }
};

// Enroll a user in a premium course
export const enrollInPremiumCourse = async (courseId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      throw new Error('User not authenticated');
    }

    // First check if the user is already enrolled
    const { data: existingEnrollment } = await supabase
      .from('premium_course_enrollments')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (existingEnrollment) {
      return existingEnrollment;
    }

    // If not enrolled, create a new enrollment
    const { data, error } = await supabase
      .from('premium_course_enrollments')
      .insert({
        user_id: user.user.id,
        course_id: courseId,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error enrolling in premium course:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in enrollInPremiumCourse:', error);
    throw error;
  }
};

// Check if a user is enrolled in a specific course
export const isUserEnrolled = async (courseId: string) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user || !user.user) {
      return false;
    }

    const { data, error } = await supabase
      .from('premium_course_enrollments')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('course_id', courseId)
      .maybeSingle();

    if (error) {
      console.error('Error checking user enrollment:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in isUserEnrolled:', error);
    return false;
  }
};

// Get all enrollments (admin function)
export const getAdminPremiumEnrollments = async () => {
  try {
    const { data, error } = await supabase
      .from('premium_course_enrollments')
      .select(`
        *,
        users:user_id(email, id),
        courses:premium_courses(id, title)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin premium enrollments:', error);
      throw error;
    }

    // Format the data for easier use in the UI
    return data.map(enrollment => ({
      id: enrollment.id,
      user_id: enrollment.user_id,
      course_id: enrollment.course_id,
      user_email: enrollment.users?.email,
      course_title: enrollment.courses?.title,
      status: enrollment.status,
      created_at: enrollment.created_at,
      updated_at: enrollment.updated_at
    })) as PremiumEnrollment[];
  } catch (error) {
    console.error('Error in getAdminPremiumEnrollments:', error);
    throw error;
  }
};
