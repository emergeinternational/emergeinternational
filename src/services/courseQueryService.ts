
import { supabase } from "@/integrations/supabase/client";
import { Course } from "./courseTypes";
import { sanitizeCourseData } from "./courseTypes";
import { validateAndUpdateCourseImage } from "@/utils/courseImageValidator";

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
