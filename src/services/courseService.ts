
import { supabase } from "@/integrations/supabase/client";

// Define interfaces based on actual database schema
export interface Course {
  id: string;
  title: string;
  summary?: string;
  content_type: string;
  image_url?: string;
  category_id: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  levelName?: string;
  duration?: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  date_started: string;
  date_completed?: string;
  course_category?: string;
  created_at: string;
  updated_at: string;
}

// Get courses with optional filtering
export const getCourses = async (
  categoryId?: string,
  limit: number = 10,
  featuredOnly: boolean = false
): Promise<Course[]> => {
  try {
    let query = supabase
      .from('education_content')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }
    
    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
    
    // Map database results to Course interface
    // Use actual properties from education_content
    return data.map(item => ({
      id: item.id,
      title: item.title,
      summary: item.summary || '',
      content_type: item.content_type,
      image_url: item.image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop',
      category_id: item.category_id,
      is_featured: item.is_featured,
      published_at: item.published_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      duration: item.content_type === 'course' ? '10-12 weeks' : '1-2 days',
    }));
  } catch (error) {
    console.error("Unexpected error in getCourses:", error);
    return [];
  }
};

// Get featured courses
export const getFeaturedCourses = async (limit: number = 3): Promise<Course[]> => {
  return getCourses(undefined, limit, true);
};

// Get a specific course by ID
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    const { data, error } = await supabase
      .from('education_content')
      .select('*')
      .eq('id', courseId)
      .single();
    
    if (error) {
      console.error("Error fetching course:", error);
      throw error;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      title: data.title,
      summary: data.summary || '',
      content_type: data.content_type,
      image_url: data.image_url || 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop',
      category_id: data.category_id,
      is_featured: data.is_featured,
      published_at: data.published_at,
      created_at: data.created_at,
      updated_at: data.updated_at,
      duration: data.content_type === 'course' ? '10-12 weeks' : '1-2 days'
    };
  } catch (error) {
    console.error("Unexpected error in getCourseById:", error);
    return null;
  }
};

// Get course progress for a user
export const getUserCourseProgress = async (userId: string): Promise<CourseProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching course progress:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error in getUserCourseProgress:", error);
    return [];
  }
};

// Create or update course progress
export const updateCourseProgress = async (
  userId: string,
  courseId: string,
  status: string,
  courseCategory?: string
): Promise<boolean> => {
  try {
    // Check if progress record exists
    const { data: existingData } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (existingData) {
      // Update existing record
      const { error } = await supabase
        .from('user_course_progress')
        .update({
          status,
          updated_at: new Date().toISOString(),
          date_completed: status === 'completed' ? new Date().toISOString() : existingData.date_completed
        })
        .eq('id', existingData.id);
      
      if (error) {
        console.error("Error updating course progress:", error);
        throw error;
      }
    } else {
      // Create new record
      const { error } = await supabase
        .from('user_course_progress')
        .insert([{
          user_id: userId,
          course_id: courseId,
          status,
          course_category: courseCategory,
          date_started: new Date().toISOString()
        }]);
      
      if (error) {
        console.error("Error creating course progress:", error);
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error in updateCourseProgress:", error);
    return false;
  }
};

// Get recommended courses based on user interests
export const getRecommendedCourses = async (userId: string, limit: number = 3): Promise<Course[]> => {
  try {
    // For now, just return featured courses as recommendations
    // In future this could be based on user preferences or course history
    return getFeaturedCourses(limit);
  } catch (error) {
    console.error("Unexpected error in getRecommendedCourses:", error);
    return [];
  }
};

// Update CourseCard component to use the actual data structure
<lov-write file_path="src/components/education/CourseCard.tsx">
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface CourseCardProps {
  id: number;
  name: string;
  level: string;
  description: string;
  image: string;
  duration?: string;
  levelName: string;
}

const CourseCard = ({ id, name, level, description, image, duration, levelName }: CourseCardProps) => {
  return (
    <Link 
      to={`/education/course/${id}`} 
      className="bg-white group shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
    >
      <div className="aspect-video overflow-hidden">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500 uppercase">
            {levelName}
          </span>
          {duration && (
            <span className="text-xs text-emerge-gold">{duration}</span>
          )}
        </div>
        <h3 className="font-medium text-lg mb-2">{name}</h3>
        <p className="text-gray-600 text-sm flex-grow">
          {description}
        </p>
        <div className="mt-4">
          <span className="text-emerge-gold group-hover:underline flex items-center">
            Learn More <ChevronRight size={16} className="ml-1" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
