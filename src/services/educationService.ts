
import { supabase } from "@/integrations/supabase/client";

export interface EducationCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EducationContent {
  id: string;
  category_id: string;
  title: string;
  summary?: string;
  content_type: string;
  source_url?: string;
  image_url?: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export const getEducationCategories = async (): Promise<EducationCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('education_categories')
      .select('*')
      .order('name');
    
    if (error) {
      console.error("Error fetching education categories:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error in getEducationCategories:", error);
    return [];
  }
};

export const getEducationContent = async (
  categoryId?: string,
  limit: number = 10,
  featuredOnly: boolean = false
): Promise<EducationContent[]> => {
  try {
    let query = supabase
      .from('education_content')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching education content:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error in getEducationContent:", error);
    return [];
  }
};

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
    return {};
  }
};
