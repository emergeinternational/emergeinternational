
// Simple Course Service
// This is a standalone service that uses hardcoded sample data
// to avoid the deep type recursion issues

export interface SimpleCourse {
  id: string;
  title: string;
  description?: string;
  level?: string;
  source_url?: string;
  image_url?: string;
  content_type?: 'video' | 'weekly' | 'external';
  talent_type?: string;
  category_id?: string;
  summary?: string;
}

export interface WeeklyContentItem {
  title: string;
  content: string;
}

// Sample courses with static data
const sampleCourses: SimpleCourse[] = [
  {
    id: "001",
    title: "Introduction to Fashion Modeling",
    description: "Learn the basics of fashion modeling from industry professionals",
    level: "Beginner",
    source_url: "https://www.youtube.com/watch?v=modelwalk101",
    image_url: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7",
    content_type: "video",
    talent_type: "model",
    category_id: "modeling",
    summary: "This comprehensive course covers the fundamentals of fashion modeling, including runway techniques, posing for photoshoots, and working with designers. Perfect for beginners looking to enter the modeling industry."
  },
  {
    id: "002",
    title: "Advanced Fashion Design",
    description: "Take your design skills to the next level with advanced techniques",
    level: "Advanced",
    source_url: "https://www.udemy.com/course/advanced-fashion-design",
    image_url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    content_type: "external",
    talent_type: "designer",
    category_id: "design",
    summary: "Explore advanced fashion design concepts including draping techniques, innovative pattern making, and sustainable design practices. This course is designed for experienced fashion designers looking to push their creative boundaries."
  },
  {
    id: "003",
    title: "Fashion Business Essentials",
    description: "Learn the fundamentals of running a successful fashion business",
    level: "Intermediate",
    source_url: "",
    image_url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    content_type: "weekly",
    talent_type: "business",
    category_id: "business",
    summary: "Master the business side of fashion with this comprehensive weekly course covering marketing strategies, financial planning, supply chain management, and brand development for fashion entrepreneurs."
  }
];

/**
 * Loads all available courses
 */
export const loadCourses = async (): Promise<SimpleCourse[]> => {
  // In a real implementation, this would fetch from an API or database
  // For now, we'll simply return our static data
  return Promise.resolve(sampleCourses);
};

/**
 * Loads a single course by ID
 */
export const loadCourseById = async (id: string): Promise<SimpleCourse | null> => {
  // Find the course with the matching ID
  const course = sampleCourses.find(c => c.id === id);
  return Promise.resolve(course || null);
};

/**
 * Loads weekly content for a course
 */
export const loadWeeklyContent = async (courseId: string): Promise<WeeklyContentItem[]> => {
  // In a real implementation, this would fetch from an API based on the course ID
  // For now, we'll return static sample data
  return Promise.resolve([
    {
      title: "Week 1: Introduction to the Course",
      content: "Overview of the course curriculum and learning objectives. Introduction to key concepts and terminology."
    },
    {
      title: "Week 2: Core Principles",
      content: "Deep dive into the fundamental principles and methodologies. Practical exercises to reinforce learning."
    },
    {
      title: "Week 3: Advanced Techniques",
      content: "Exploration of advanced techniques and their applications in real-world scenarios. Case studies and examples."
    }
  ]);
};

/**
 * Safely formats a video URL for embedding
 */
export const getSafeVideoEmbedUrl = (url?: string): string | null => {
  if (!url) return null;
  
  // Handle YouTube URLs
  if (url.includes('youtube.com/watch')) {
    const videoId = new URLSearchParams(url.split('?')[1]).get('v');
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // Handle youtu.be format
  if (url.includes('youtu.be/')) {
    const parts = url.split('/');
    const videoId = parts[parts.length - 1].split('?')[0];
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
  }
  
  // Handle Vimeo URLs
  if (url.includes('vimeo.com')) {
    const parts = url.split('/');
    const videoId = parts[parts.length - 1].split('?')[0];
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }
  
  // If it's already an embed URL, return it as is
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) {
    return url;
  }
  
  // If we can't parse it, return null
  return null;
};

/**
 * Tracks user progress for courses (simplified implementation)
 */
export const trackCourseProgress = async (courseId: string, categoryId: string): Promise<void> => {
  console.log(`Progress tracked for course ${courseId} in category ${categoryId}`);
  
  // In a real implementation, this would store progress in a database
  // For example:
  // await supabase
  //   .from('course_progress')
  //   .upsert({ 
  //     user_id: userId, 
  //     course_id: courseId, 
  //     category_id: categoryId, 
  //     progress: 'started' 
  //   });
  
  return Promise.resolve();
};
