
import { supabase } from "@/integrations/supabase/client";
import { EducationCategory } from "./types";
import { fallbackCategories } from "./fallbackData";

/**
 * Gets education categories with fallback to static data
 */
export const getEducationCategories = async (): Promise<EducationCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('education_categories')
      .select('*')
      .order('name');

    if (error) {
      console.error("Error fetching education categories:", error);
      return fallbackCategories;
    }

    return data || fallbackCategories;
  } catch (error) {
    console.error("Unexpected error in getEducationCategories:", error);
    return fallbackCategories;
  }
};
