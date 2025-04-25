
/**
 * Simple Course Service
 * 
 * This service provides basic functions for fetching course data without
 * complex type inference that could cause TypeScript recursion issues.
 */

/**
 * Basic course structure - deliberately simplified to prevent type recursion
 */
export interface SimpleCourse {
  id: string;
  title: string;
  summary?: string;
  category_id?: string;
  talent_type?: string;
  content_type?: string;
  is_featured?: boolean;
  source_url?: string;
  image_url?: string;
  level?: string;
}

export interface SimpleCategory {
  id: string;
  name: string;
  description?: string;
}

export interface WeeklyContentItem {
  title: string;
  content: string;
}

export interface CourseWeeklyContent {
  course_id: string;
  content: WeeklyContentItem[];
}

/**
 * Fetches all courses from the static JSON file
 */
export async function loadCourses(): Promise<SimpleCourse[]> {
  try {
    const response = await fetch("/courses.json");
    if (!response.ok) {
      console.error("Failed to fetch courses:", response.statusText);
      return [];
    }
    const data = await response.json();
    return data.courses || [];
  } catch (error) {
    console.error("Error loading courses:", error);
    return [];
  }
}

/**
 * Fetches a single course by ID
 */
export async function loadCourseById(id: string): Promise<SimpleCourse | null> {
  try {
    const courses = await loadCourses();
    return courses.find(course => course.id === id) || null;
  } catch (error) {
    console.error("Error loading course by ID:", error);
    return null;
  }
}

/**
 * Fetches all categories from the static JSON file
 */
export async function loadCategories(): Promise<SimpleCategory[]> {
  try {
    const response = await fetch("/courses.json");
    if (!response.ok) {
      console.error("Failed to fetch categories:", response.statusText);
      return [];
    }
    const data = await response.json();
    return data.categories || [];
  } catch (error) {
    console.error("Error loading categories:", error);
    return [];
  }
}

/**
 * Fetches all talent types from the static JSON file
 */
export async function loadTalentTypes(): Promise<string[]> {
  try {
    const response = await fetch("/courses.json");
    if (!response.ok) {
      console.error("Failed to fetch talent types:", response.statusText);
      return [];
    }
    const data = await response.json();
    return data.talent_types || [];
  } catch (error) {
    console.error("Error loading talent types:", error);
    return [];
  }
}

/**
 * Fetches filtered courses based on category and talent type
 */
export async function loadFilteredCourses(
  categoryId?: string, 
  talentType?: string,
  featuredOnly: boolean = false
): Promise<SimpleCourse[]> {
  try {
    const courses = await loadCourses();
    
    return courses.filter(course => {
      // Check category filter
      const matchesCategory = !categoryId || categoryId === 'all' || course.category_id === categoryId;
      
      // Check talent type filter
      const matchesTalent = !talentType || talentType === 'all' || course.talent_type === talentType;
      
      // Check featured filter
      const matchesFeatured = !featuredOnly || course.is_featured === true;
      
      return matchesCategory && matchesTalent && matchesFeatured;
    });
  } catch (error) {
    console.error("Error loading filtered courses:", error);
    return [];
  }
}

/**
 * Fetches weekly content for a course
 */
export async function loadWeeklyContent(courseId: string): Promise<WeeklyContentItem[]> {
  try {
    const response = await fetch("/courses.json");
    if (!response.ok) {
      console.error("Failed to fetch weekly content:", response.statusText);
      return [];
    }
    
    const data = await response.json();
    const weeklyData = data.weekly_content || [];
    
    const courseContent = weeklyData.find((item: CourseWeeklyContent) => item.course_id === courseId);
    return courseContent ? courseContent.content : [];
  } catch (error) {
    console.error("Error loading weekly content:", error);
    return [];
  }
}

/**
 * Safe video embed URL generator
 * Returns a safe embed URL if possible, or null if the URL isn't valid
 */
export function getSafeVideoEmbedUrl(url?: string): string | null {
  if (!url) return null;
  
  try {
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId: string | null = null;
      
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split(/[?&#]/)[0];
      } else if (url.includes('youtube.com/watch')) {
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        videoId = urlParams.get('v');
      } else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('youtube.com/embed/')[1]?.split(/[?&#]/)[0];
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error processing video URL:", error);
    return null;
  }
}
