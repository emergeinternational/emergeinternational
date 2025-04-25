
import { supabase } from "@/integrations/supabase/client";
// Import the type from fallbackData instead since it's defined there
import { getFallbackContent } from "./fallbackData";

// Static test course guaranteed to work
const TEST_COURSE = {
  id: "test-001",
  title: "Introduction to Fashion Photography",
  level: "Beginner",
  category: "photography",
  content_type: "video",
  videoUrl: "https://www.youtube.com/embed/4p-4fmb8dDQ",
  description: "Learn the basics of fashion photography with this introductory course.",
  talent_type: "photographer",
  is_featured: true
};

/**
 * Gets education content with simplified return type
 */
export const getEducationContent = async (
  categoryId?: string,
  limit: number = 50,
  featuredOnly: boolean = false,
  talentType?: string
): Promise<any[]> => {
  try {
    // During testing/development, return test course
    return [TEST_COURSE];
  } catch (error) {
    console.error("Error in getEducationContent:", error);
    return [TEST_COURSE];
  }
};
