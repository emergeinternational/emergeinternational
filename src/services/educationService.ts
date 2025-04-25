
import { supabase } from "@/integrations/supabase/client";

// Define our interfaces for education data
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

// Static fallback data for categories
const fallbackCategories: EducationCategory[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    description: 'Courses and resources for those new to fashion',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'intermediate',
    name: 'Intermediate',
    description: 'Take your skills to the next level',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'advanced',
    name: 'Advanced',
    description: 'Master advanced techniques and concepts',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'workshop',
    name: 'Workshop',
    description: 'Hands-on learning experiences',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Static fallback content
const fallbackContent: EducationContent[] = [
  { 
    id: "1", 
    category_id: "beginner",
    title: "Fashion Design 101", 
    summary: "Master the fundamentals of fashion design through hands-on projects. Learn sketching, pattern making, and create your first collection.",
    content_type: "course",
    image_url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "2", 
    category_id: "beginner",
    title: "Digital Fashion Marketing", 
    summary: "Learn to market fashion products effectively using social media, email marketing, and digital advertising strategies.",
    content_type: "course",
    image_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop",
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "3", 
    category_id: "advanced",
    title: "Advanced Pattern Making", 
    summary: "Master complex pattern making techniques for haute couture and ready-to-wear collections. Includes draping and 3D modeling.",
    content_type: "course",
    image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&auto=format&fit=crop",
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "4", 
    category_id: "intermediate",
    title: "Sustainable Fashion", 
    summary: "Learn eco-friendly design practices, sustainable materials sourcing, and ethical production methods for conscious fashion.",
    content_type: "course",
    image_url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "5", 
    category_id: "intermediate",
    title: "Fashion Portfolio", 
    summary: "Create a professional portfolio showcasing your designs. Learn photography, styling, and digital presentation techniques.",
    content_type: "course",
    image_url: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=800&auto=format&fit=crop",
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  { 
    id: "6", 
    category_id: "workshop",
    title: "Innovation Workshop", 
    summary: "Explore cutting-edge textile techniques and innovative materials in this intensive hands-on workshop.",
    content_type: "workshop",
    image_url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",
    is_featured: true,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

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

/**
 * Gets education content with fallback to static data
 */
export const getEducationContent = async (
  categoryId?: string,
  limit: number = 50, // Increased limit to ensure we get more content
  featuredOnly: boolean = false
): Promise<EducationContent[]> => {
  try {
    console.log(`Fetching education content. CategoryID: ${categoryId || 'all'}, Limit: ${limit}`);
    
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

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching education content:", error);
      const fallbackData = getFallbackContent(categoryId, limit, featuredOnly);
      console.log(`Using fallback data: ${fallbackData.length} items`);
      return fallbackData;
    }

    if (data && data.length > 0) {
      console.log(`Fetched ${data.length} courses from database`);
      return data;
    } else {
      console.log("No data returned from database, using fallback");
      return getFallbackContent(categoryId, limit, featuredOnly);
    }
  } catch (error) {
    console.error("Error in getEducationContent:", error);
    return getFallbackContent(categoryId, limit, featuredOnly);
  }
};

// Helper function to filter fallback content
const getFallbackContent = (categoryId?: string, limit: number = 50, featuredOnly: boolean = false): EducationContent[] => {
  let filtered = [...fallbackContent];
  
  if (categoryId) {
    filtered = filtered.filter(item => item.category_id === categoryId);
  }
  
  if (featuredOnly) {
    filtered = filtered.filter(item => item.is_featured);
  }
  
  console.log(`Filtered fallback content: ${filtered.length} items`);
  return filtered.slice(0, limit);
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
    for (const category of fallbackCategories) {
      result[category.id] = fallbackContent
        .filter(item => item.category_id === category.id)
        .slice(0, 5);
    }
    
    return result;
  }
};
