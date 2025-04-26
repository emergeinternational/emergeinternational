
import { supabase } from "@/integrations/supabase/client";
import type { Course, CourseProgress } from "./courseTypes";
import { validateAndUpdateCourseImage } from "@/utils/courseImageValidator";
import { getUserCourseProgress } from "./courseProgressService";

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
    const { data, error } = await supabase
      .from("education_content")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching course by ID:", error);
      return null;
    }

    const course: Course = {
      id: data.id,
      title: data.title,
      summary: data.summary,
      category: data.category_id || '',
      level: data.content_type || '',
      source_url: data.source_url,
      image_url: data.image_url,
      content_type: data.content_type,
      category_id: data.category_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    return course;
  } catch (error) {
    console.error("Unexpected error in getCourseById:", error);
    return null;
  }
};

export const getAllCourses = async (): Promise<Course[]> => {
  try {
    const { data, error } = await supabase
      .from("education_content")
      .select("*");

    if (error) {
      console.error("Error fetching all courses:", error);
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
      career_interests: []
    }));
  } catch (error) {
    console.error("Unexpected error in getAllCourses:", error);
    return [];
  }
};

export const getPopularCourses = async (): Promise<Course[]> => {
  try {
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

    const coursesWithValidImages = await Promise.all(
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
          career_interests: []
        };
      })
    );

    if (careerInterest && careerInterest !== "all") {
      return coursesWithValidImages.filter(course => 
        course.career_interests?.includes(careerInterest)
      );
    }

    return coursesWithValidImages;
  } catch (error) {
    console.error("Unexpected error in getCourses:", error);
    return [];
  }
};

export const getStaticCourses = (): Course[] => {
  return [
    {
      id: "1",
      title: "Fashion Design Fundamentals",
      summary: "Learn the basics of fashion design",
      category: "beginner",
      category_id: "beginner",
      level: "beginner",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-design",
      content_type: "course",
      career_interests: ["designer"]
    },
    {
      id: "2",
      title: "Advanced Pattern Making",
      summary: "Master the art of pattern making",
      category: "advanced",
      category_id: "advanced",
      level: "advanced",
      duration: "12 weeks",
      image_url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/pattern-making",
      content_type: "course",
      career_interests: ["designer"]
    },
    {
      id: "3",
      title: "Fashion Photography Basics",
      summary: "Learn how to capture fashion photography",
      category: "beginner",
      category_id: "beginner",
      level: "beginner",
      duration: "6 weeks",
      image_url: "https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-photography",
      content_type: "course",
      career_interests: ["photographer"]
    },
    {
      id: "4",
      title: "Runway Walk Techniques",
      summary: "Perfect your runway walk for fashion shows",
      category: "beginner",
      category_id: "beginner",
      level: "beginner",
      duration: "4 weeks",
      image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/runway-walk",
      content_type: "course",
      career_interests: ["model"]
    },
    {
      id: "5",
      title: "Video Production for Fashion",
      summary: "Create professional fashion videos",
      category: "intermediate",
      category_id: "intermediate",
      level: "intermediate",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/video-production",
      content_type: "course",
      career_interests: ["videographer"]
    },
    {
      id: "6",
      title: "Songwriting for Fashion Shows",
      summary: "Create compelling music for runway shows",
      category: "intermediate",
      category_id: "intermediate",
      level: "intermediate",
      duration: "6 weeks",
      image_url: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-music",
      content_type: "course",
      career_interests: ["musical_artist"]
    },
    {
      id: "7",
      title: "Fashion Illustration Techniques",
      summary: "Master drawing and painting fashion illustrations",
      category: "beginner",
      category_id: "beginner",
      level: "beginner",
      duration: "10 weeks",
      image_url: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-illustration",
      content_type: "course",
      career_interests: ["fine_artist"]
    },
    {
      id: "8",
      title: "Fashion Show Planning",
      summary: "Learn to plan and execute successful fashion events",
      category: "advanced",
      category_id: "advanced",
      level: "advanced",
      duration: "8 weeks",
      image_url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop",
      source_url: "https://example.com/course/fashion-show-planning",
      content_type: "course",
      career_interests: ["event_planner"]
    }
  ];
};
