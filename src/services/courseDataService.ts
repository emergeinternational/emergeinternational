
import { supabase } from "@/integrations/supabase/client";
import type { Course, CourseProgress, CourseCategory, CourseLevel, CourseHostingType } from "./courseTypes";
import { validateAndUpdateCourseImage } from "@/utils/courseImageValidator";
import { getUserCourseProgress } from "./courseProgressService";
import { 
  getDefaultCourseCategory, 
  getDefaultCourseLevel, 
  getDefaultHostingType, 
  sanitizeCourseData,
  sanitizeCourseProgress
} from "./courseTypes";

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

export const getCourseById = async (id: string): Promise<Course | null> => {
  try {
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (courseData) {
      return sanitizeCourseData(courseData);
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

    return sanitizeCourseData({
      id: data.id,
      title: data.title,
      summary: data.summary,
      category: data.category_id,
      level: data.content_type,
      source_url: data.source_url,
      image_url: data.image_url,
      content_type: data.content_type,
      category_id: data.category_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      video_embed_url: data.source_url,
      external_link: data.source_url,
      hosting_type: 'hosted'
    });
  } catch (error) {
    console.error("Unexpected error in getCourseById:", error);
    return null;
  }
};

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    let { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("*");

    if (coursesData && coursesData.length > 0) {
      return coursesData.map(item => sanitizeCourseData(item));
    }

    const { data, error } = await supabase
      .from("education_content")
      .select("*");

    if (error) {
      console.error("Error fetching all courses:", error);
      return [];
    }

    return data.map(item => sanitizeCourseData({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category_id,
      level: item.content_type,
      source_url: item.source_url,
      image_url: item.image_url,
      content_type: item.content_type,
      category_id: item.category_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      video_embed_url: item.source_url,
      external_link: item.source_url,
      hosting_type: 'hosted',
      career_interests: []
    }));
  } catch (error) {
    console.error("Unexpected error in getAllCourses:", error);
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
      return coursesData.map(item => sanitizeCourseData({
        ...item,
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

    return data.map(item => sanitizeCourseData({
      id: item.id,
      title: item.title,
      summary: item.summary,
      category: item.category_id,
      level: item.content_type,
      source_url: item.source_url,
      image_url: item.image_url,
      content_type: item.content_type,
      category_id: item.category_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      isPopular: item.is_featured,
      hosting_type: 'hosted'
    }));
  } catch (error) {
    console.error("Unexpected error in getPopularCourses:", error);
    return [];
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
      courseQuery = courseQuery.eq("level", level);
    }

    if (featured) {
      courseQuery = courseQuery.eq("is_published", true);
    }

    if (limit > 0) {
      courseQuery = courseQuery.limit(limit);
    }

    let { data: coursesData, error: coursesError } = await courseQuery;
    
    if (coursesData && coursesData.length > 0) {
      const sanitizedCourses = coursesData.map(item => sanitizeCourseData(item));
      
      if (careerInterest && careerInterest !== "all") {
        return sanitizedCourses.filter(course => 
          course.career_interests?.includes(careerInterest)
        );
      }
      
      return sanitizedCourses;
    }

    let query = supabase.from("education_content").select("*");

    if (level && level !== "all") {
      query = query.eq("content_type", level);
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

    try {
      const coursesWithValidImages = await Promise.all(
        data.map(async (item) => {
          let validatedImageUrl = item.image_url;
          
          try {
            validatedImageUrl = await validateAndUpdateCourseImage(
              item.id, 
              item.title, 
              item.image_url
            );
          } catch (imgError) {
            console.error("Error validating image:", imgError);
            validatedImageUrl = item.image_url || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop";
          }

          return sanitizeCourseData({
            id: item.id,
            title: item.title,
            summary: item.summary,
            category: item.category_id,
            level: item.content_type,
            source_url: item.source_url,
            image_url: validatedImageUrl,
            content_type: item.content_type,
            category_id: item.category_id,
            created_at: item.created_at,
            updated_at: item.updated_at,
            video_embed_url: item.source_url,
            external_link: item.source_url,
            hosting_type: 'hosted',
            career_interests: []
          });
        })
      );

      if (careerInterest && careerInterest !== "all") {
        const safeCareerInterest = getDefaultCourseCategory(careerInterest) 
          ? careerInterest 
          : "all";
        
        if (safeCareerInterest !== "all") {
          return coursesWithValidImages.filter(course => 
            course.career_interests?.includes(safeCareerInterest)
          );
        }
      }

      return coursesWithValidImages;
    } catch (processError) {
      console.error("Error processing courses:", processError);
      return getStaticCourses();
    }
  } catch (error) {
    console.error("Unexpected error in getCourses:", error);
    return getStaticCourses();
  }
};

export const getStaticCourses = (): Course[] => {
  return [
    {
      id: "1",
      title: "Fashion Design Fundamentals",
      summary: "Learn the basics of fashion design",
      category: 'designer',
      level: 'beginner',
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-design",
      content_type: "course",
      career_interests: ["designer"],
      hosting_type: 'hosted'
    },
    {
      id: "2",
      title: "Advanced Pattern Making",
      summary: "Master the art of pattern making",
      category: "designer",
      level: "expert",
      duration: "12 weeks",
      image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/pattern-making",
      content_type: "course",
      career_interests: ["designer"],
      hosting_type: "hosted"
    },
    {
      id: "3",
      title: "Fashion Photography Basics",
      summary: "Learn how to capture fashion photography",
      category: "photographer",
      level: "beginner",
      duration: "6 weeks",
      image_url: "https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-photography",
      content_type: "course",
      career_interests: ["photographer"],
      hosting_type: "hosted"
    },
    {
      id: "4",
      title: "Runway Walk Techniques",
      summary: "Perfect your runway walk for fashion shows",
      category: "model",
      level: "beginner",
      duration: "4 weeks",
      image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/runway-walk",
      content_type: "course",
      career_interests: ["model"],
      hosting_type: "hosted"
    },
    {
      id: "5",
      title: "Video Production for Fashion",
      summary: "Create professional fashion videos",
      category: "videographer",
      level: "intermediate",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/video-production",
      content_type: "course",
      career_interests: ["videographer"],
      hosting_type: "hosted"
    },
    {
      id: "6",
      title: "Songwriting for Fashion Shows",
      summary: "Create compelling music for runway shows",
      category: "musical_artist",
      level: "intermediate",
      duration: "6 weeks",
      image_url: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-music",
      content_type: "course",
      career_interests: ["musical_artist"],
      hosting_type: "hosted"
    },
    {
      id: "7",
      title: "Fashion Illustration Techniques",
      summary: "Master drawing and painting fashion illustrations",
      category: "fine_artist",
      level: "beginner",
      duration: "10 weeks",
      image_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-illustration",
      content_type: "course",
      career_interests: ["fine_artist"],
      hosting_type: "hosted"
    },
    {
      id: "8",
      title: "Fashion Show Planning",
      summary: "Learn to plan and execute successful fashion events",
      category: "event_planner",
      level: "expert",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-show-planning",
      content_type: "course",
      career_interests: ["event_planner"],
      hosting_type: "hosted"
    }
  ];
};
