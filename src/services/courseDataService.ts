import { supabase } from "@/integrations/supabase/client";
import type { Course, CourseProgress, CourseCategory, CourseLevel, CourseHostingType } from "./courseTypes";
import { validateAndUpdateCourseImage } from "@/utils/courseImageValidator";
import { getUserCourseProgress } from "./courseProgressService";

const validateCategory = (category: string): CourseCategory => {
  const validCategories: CourseCategory[] = ['model', 'designer', 'photographer', 'videographer', 'musical_artist', 'fine_artist', 'event_planner'];
  return validCategories.includes(category as CourseCategory) 
    ? (category as CourseCategory) 
    : 'model';
};

const validateLevel = (level: string): CourseLevel => {
  const validLevels: CourseLevel[] = ['beginner', 'intermediate', 'expert'];
  return validLevels.includes(level as CourseLevel) 
    ? (level as CourseLevel) 
    : 'beginner';
};

const validateHostingType = (type: string): CourseHostingType => {
  const validTypes: CourseHostingType[] = ['hosted', 'embedded', 'external'];
  return validTypes.includes(type as CourseHostingType)
    ? (type as CourseHostingType)
    : 'hosted';
};

export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (courseData) {
      return {
        ...courseData,
        category: validateCategory(courseData.category),
        level: validateLevel(courseData.level || 'beginner'),
        hosting_type: validateHostingType(courseData.hosting_type)
      } as Course;
    }

    const { data, error } = await supabase
      .from("education_content")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching course by ID:", error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      summary: data.summary,
      category: validateCategory(data.category_id || 'model'),
      level: validateLevel(data.content_type || 'beginner'),
      source_url: data.source_url,
      image_url: data.image_url,
      content_type: data.content_type,
      category_id: data.category_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      video_embed_url: data.source_url,
      external_link: data.source_url,
      hosting_type: 'hosted' as CourseHostingType,
      career_interests: []
    } as Course;
  } catch (error) {
    console.error("Unexpected error in getCourseById:", error);
    return null;
  }
};

export const getEligibleUsers = async (): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from("certificate_eligibility")
      .select("*, profiles(*)");

    if (error) {
      console.error("Error fetching eligible users:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error in getEligibleUsers:", error);
    return [];
  }
};

export const updateCertificateApproval = async (
  userId: string,
  approved: boolean
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("certificate_eligibility")
      .update({ admin_approved: approved })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating certificate approval:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in updateCertificateApproval:", error);
    return false;
  }
};

export const trackCourseEngagement = async (courseId: string): Promise<boolean> => {
  try {
    const { data: existing, error: fetchError } = await supabase
      .from("course_engagement")
      .select("*")
      .eq("course_id", courseId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error checking course engagement:", fetchError);
      return false;
    }

    if (existing) {
      const { error } = await supabase
        .from("course_engagement")
        .update({
          total_clicks: (existing.total_clicks || 0) + 1,
          last_click_date: new Date().toISOString()
        })
        .eq("id", existing.id);

      if (error) {
        console.error("Error updating course engagement:", error);
        return false;
      }
    } else {
      const { error } = await supabase
        .from("course_engagement")
        .insert({
          course_id: courseId,
          total_clicks: 1,
          last_click_date: new Date().toISOString()
        });

      if (error) {
        console.error("Error creating course engagement:", error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error("Unexpected error in trackCourseEngagement:", error);
    return false;
  }
};

export const getCoursesWithProgress = async (
  userId?: string
): Promise<(Course & { userProgress?: CourseProgress | null })[]> => {
  try {
    const courses = await getAllCourses();
    
    if (!userId) {
      return courses.map(course => ({ ...course, userProgress: null }));
    }

    const userProgress = await getUserCourseProgress(userId);
    
    return courses.map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        ...course,
        userProgress: progress || null
      };
    });
  } catch (error) {
    console.error("Error in getCoursesWithProgress:", error);
    return [];
  }
};

export const getCoursesForCategory = async (
  category: string,
  userId?: string
): Promise<(Course & { userProgress?: CourseProgress | null })[]> => {
  try {
    const courses = await getAllCourses();
    const categoryCourses = courses.filter(course => course.category === category);
    
    if (!userId) {
      return categoryCourses.map(course => ({ ...course, userProgress: null }));
    }

    const userProgress = await getUserCourseProgress(userId);
    
    return categoryCourses.map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        ...course,
        userProgress: progress || null
      };
    });
  } catch (error) {
    console.error("Error in getCoursesForCategory:", error);
    return [];
  }
};

export const getCourses = async (
  level?: string,
  limit: number = 20,
  featured: boolean = false,
  careerInterest?: string
): Promise<Course[]> => {
  try {
    let courseQuery = supabase.from("courses").select("*");

    if (level && level !== "all") {
      courseQuery = courseQuery.eq("level", validateLevel(level));
    }

    if (featured) {
      courseQuery = courseQuery.eq("is_published", true);
    }

    if (limit > 0) {
      courseQuery = courseQuery.limit(limit);
    }

    let { data: coursesData, error: coursesError } = await courseQuery;
    
    if (coursesData && coursesData.length > 0) {
      const coursesWithValidTypes = coursesData.map(course => ({
        ...course,
        category: validateCategory(course.category),
        level: validateLevel(course.level || 'beginner'),
        hosting_type: validateHostingType(course.hosting_type),
        career_interests: [course.category]
      })) as Course[];

      if (careerInterest && careerInterest !== "all") {
        const validCategory = validateCategory(careerInterest);
        return coursesWithValidTypes.filter(course => 
          course.category === validCategory || 
          course.career_interests?.includes(validCategory)
        );
      }

      return coursesWithValidTypes;
    }

    let query = supabase.from("education_content").select("*");

    if (level && level !== "all") {
      query = query.eq("content_type", validateLevel(level));
    }

    if (featured) {
      query = query.eq("is_featured", true);
    }

    if (limit > 0) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching courses:", error);
      return [];
    }

    const coursesWithValidTypes = await Promise.all(
      data.map(async (item) => {
        const validatedImageUrl = await validateAndUpdateCourseImage(
          item.id, 
          item.title, 
          item.image_url
        );

        return {
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.category_id || '',
          level: item.content_type || '',
          source_url: item.source_url,
          image_url: validatedImageUrl,
          content_type: item.content_type,
          category_id: item.category_id,
          created_at: item.created_at,
          updated_at: item.updated_at,
          video_embed_url: item.source_url,
          external_link: item.source_url,
          hosting_type: 'hosted' as CourseHostingType,
          career_interests: []
        };
      })
    );

    if (careerInterest && careerInterest !== "all") {
      const validCategory = validateCategory(careerInterest);
      return coursesWithValidTypes.filter(course => 
        course.career_interests?.includes(validCategory)
      );
    }

    return coursesWithValidTypes;
  } catch (error) {
    console.error("Unexpected error in getCourses:", error);
    return [];
  }
};

export const getPopularCourses = async (): Promise<Course[]> => {
  try {
    let { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .limit(8);

    if (coursesData && coursesData.length > 0) {
      return coursesData.map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary || "",
        category: item.category,
        level: item.level,
        image_url: item.image_url,
        video_embed_url: item.video_embed_url,
        external_link: item.external_link,
        hosting_type: item.hosting_type,
        is_published: item.is_published,
        created_at: item.created_at,
        updated_at: item.updated_at,
        isPopular: true
      }));
    }

    const { data, error } = await supabase
      .from("education_content")
      .select("*")
      .eq("is_featured", true);

    if (error) {
      console.error("Error fetching popular courses:", error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category_id || '',
      level: item.content_type || '',
      source_url: item.source_url,
      image_url: item.image_url,
      content_type: item.content_type,
      category_id: item.category_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      isPopular: item.is_featured
    }));
  } catch (error) {
    console.error("Unexpected error in getPopularCourses:", error);
    return [];
  }
};

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    let { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("*");

    if (coursesData && coursesData.length > 0) {
      return coursesData.map(course => ({
        ...course,
        category: validateCategory(course.category),
        level: validateLevel(course.level || 'beginner'),
        hosting_type: validateHostingType(course.hosting_type || 'hosted'),
        image_url: course.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop',
        summary: course.summary || '',
        career_interests: course.career_interests || []
      })) as Course[];
    }

    let { data, error } = await supabase
      .from("education_content")
      .select("*");

    if (error) {
      console.error("Error fetching all courses:", error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary || '',
      category: validateCategory(item.category_id || 'model'),
      level: validateLevel(item.content_type || 'beginner'),
      source_url: item.source_url || '',
      image_url: item.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop',
      content_type: item.content_type || '',
      category_id: item.category_id || '',
      created_at: item.created_at || '',
      updated_at: item.updated_at || '',
      video_embed_url: item.source_url || '',
      external_link: item.source_url || '',
      hosting_type: 'hosted' as CourseHostingType,
      career_interests: []
    })) as Course[];
  } catch (error) {
    console.error("Unexpected error in getAllCourses:", error);
    return [];
  }
};

export const getStaticCourses = (): Course[] => {
  return [
    {
      id: "1",
      title: "Fashion Design Fundamentals",
      summary: "Learn the basics of fashion design",
      category: "designer",
      level: "beginner",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-design",
      content_type: "course",
      career_interests: ["designer"],
      hosting_type: "hosted"
    } as Course,
    {
      id: "2",
      title: "Advanced Pattern Making",
      summary: "Master the art of pattern making",
      category: "designer",
      level: "expert",
      duration: "12 weeks",
      image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/pattern-making",
      content_type: "course",
      career_interests: ["designer"],
      hosting_type: "hosted"
    },
    {
      id: "3",
      title: "Fashion Photography Basics",
      summary: "Learn how to capture fashion photography",
      category: "beginner",
      level: "beginner",
      duration: "6 weeks",
      image_url: "https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-photography",
      content_type: "course",
      career_interests: ["photographer"],
      hosting_type: "hosted"
    },
    {
      id: "4",
      title: "Runway Walk Techniques",
      summary: "Perfect your runway walk for fashion shows",
      category: "beginner",
      level: "beginner",
      duration: "4 weeks",
      image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/runway-walk",
      content_type: "course",
      career_interests: ["model"],
      hosting_type: "hosted"
    },
    {
      id: "5",
      title: "Video Production for Fashion",
      summary: "Create professional fashion videos",
      category: "intermediate",
      level: "intermediate",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/video-production",
      content_type: "course",
      career_interests: ["videographer"],
      hosting_type: "hosted"
    },
    {
      id: "6",
      title: "Songwriting for Fashion Shows",
      summary: "Create compelling music for runway shows",
      category: "intermediate",
      level: "intermediate",
      duration: "6 weeks",
      image_url: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-music",
      content_type: "course",
      career_interests: ["musical_artist"],
      hosting_type: "hosted"
    },
    {
      id: "7",
      title: "Fashion Illustration Techniques",
      summary: "Master drawing and painting fashion illustrations",
      category: "beginner",
      level: "beginner",
      duration: "10 weeks",
      image_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-illustration",
      content_type: "course",
      career_interests: ["fine_artist"],
      hosting_type: "hosted"
    },
    {
      id: "8",
      title: "Fashion Show Planning",
      summary: "Learn to plan and execute successful fashion events",
      category: "advanced",
      level: "advanced",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-show-planning",
      content_type: "course",
      career_interests: ["event_planner"],
      hosting_type: "hosted"
    }
  ];
};
