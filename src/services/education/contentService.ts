
import { supabase } from "@/integrations/supabase/client";
import { EducationContent, TALENT_TYPES, TalentType } from "./types";
import { getFallbackContent } from "./fallbackData";
import { getEducationCategories } from "./categoriesService";

/**
 * Gets education content with talent type filtering
 */
export const getEducationContent = async (
  categoryId?: string,
  limit: number = 50, 
  featuredOnly: boolean = false,
  talentType?: string
): Promise<EducationContent[]> => {
  try {
    console.log(`Fetching education content. CategoryID: ${categoryId || 'all'}, Talent Type: ${talentType || 'all'}, Limit: ${limit}`);
    
    let query = supabase
      .from('education_content')
      .select('*')
      .limit(limit);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    
    if (talentType) {
      query = query.eq('talent_type', talentType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching education content:", error);
      const fallbackData = getFallbackContent(categoryId, limit, featuredOnly, talentType);
      console.log(`Using fallback data: ${fallbackData.length} items`);
      return fallbackData;
    }

    if (data && data.length > 0) {
      console.log(`Fetched ${data.length} courses from database`);
      return data;
    } else {
      console.log("No data returned from database, using fallback");
      return getFallbackContent(categoryId, limit, featuredOnly, talentType);
    }
  } catch (error) {
    console.error("Error in getEducationContent:", error);
    return getFallbackContent(categoryId, limit, featuredOnly, talentType);
  }
};

/**
 * Groups education content by category
 */
export const getEducationContentByCategory = async (): Promise<Record<string, EducationContent[]>> => {
  try {
    const categories = await getEducationCategories();
    const result: Record<string, EducationContent[]> = {};
    
    for (const category of categories) {
      const content = await getEducationContent(category.id, 5);
      result[category.id] = content;
    }
    
    return result;
  } catch (error) {
    console.error("Error in getEducationContentByCategory:", error);
    
    // Create a fallback response with the static content
    const result: Record<string, EducationContent[]> = {};
    for (const category of await getEducationCategories()) {
      result[category.id] = await getEducationContent(category.id, 5);
    }
    
    return result;
  }
};

/**
 * Groups education content by talent type using a simple iteration approach
 */
export const getEducationContentByTalentType = async (
  limit: number = 5,
  featuredOnly: boolean = false
): Promise<Record<string, EducationContent[]>> => {
  try {
    // Create a simple record to store results
    const result: Record<string, EducationContent[]> = {};
    
    // Use a simple for loop to avoid any complex type inference
    for (let i = 0; i < TALENT_TYPES.length; i++) {
      const talentType = TALENT_TYPES[i];
      // Fetch content for this talent type
      const content = await getEducationContent(undefined, limit, featuredOnly, talentType);
      // Store in the result object
      result[talentType] = content;
    }
    
    return result;
  } catch (error) {
    console.error("Error in getEducationContentByTalentType:", error);
    
    // Create a fallback with a simple structure
    const result: Record<string, EducationContent[]> = {};
    
    // Use simple for loop to avoid any potential typing issues
    for (let i = 0; i < TALENT_TYPES.length; i++) {
      const talentType = TALENT_TYPES[i];
      result[talentType] = getFallbackContent(undefined, limit, featuredOnly, talentType);
    }
    
    return result;
  }
};

export const getCourseWeeklyContent = async (courseId: string) => {
  try {
    return [
      {
        title: "Week 1: Introduction to Design Principles",
        content: "This week covers the fundamentals of design thinking and principles that form the foundation of fashion design."
      },
      {
        title: "Week 2: Creating Mood Boards",
        content: "Learn how to create effective mood boards that communicate your vision and inspiration."
      }
    ];
  } catch (error) {
    console.error('Error getting weekly course content:', error);
    return [];
  }
};
