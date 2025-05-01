
export type CourseCategory = 'development' | 'design' | 'business' | 'marketing' | 'education' | 'music' | 'art' | 'model' | 'designer' | 'photographer' | 'videographer' | 'musical_artist' | 'fine_artist' | 'event_planner';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type HostingType = 'external' | 'hosted' | 'embedded';

// Define CourseHostingType - needed for components
export type CourseHostingType = HostingType;

export interface Course {
  id: string;
  title: string;
  summary?: string;
  category: CourseCategory;
  level?: CourseLevel;
  image_url?: string;
  video_embed_url?: string;
  external_link?: string;
  hosting_type: CourseHostingType;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  price?: number;
  // Additional fields used in CourseDetail and Education components
  source_url?: string;
  duration?: string;
  content_type?: string;
  category_id?: string;
  image?: string;
  link?: string;
  career_interests?: string[];
  content?: string;
  location?: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  status: 'started' | 'in_progress' | 'completed';
  date_started?: string;
  date_completed?: string;
  course_category?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export interface ScrapedCourse {
  id: string;
  title: string;
  summary?: string;
  category: CourseCategory;
  level: CourseLevel;
  image_url?: string;
  video_embed_url?: string;
  external_link?: string;
  hosting_type: CourseHostingType;
  is_approved: boolean;
  is_reviewed: boolean;
  review_notes?: string;
  created_at?: string;
  updated_at?: string;
  scraper_source: string;
  hash_identifier?: string;
  is_duplicate?: boolean;
  duplicate_confidence?: number;
  duplicate_of?: string;
}

// Helper function for course data sanitization
export function sanitizeCourseData(data: any): Course {
  return {
    id: data.id || '',
    title: data.title || '',
    summary: data.summary,
    category: data.category || data.category_id || 'model',
    level: data.level || 'beginner',
    image_url: data.image_url || data.image,
    video_embed_url: data.video_embed_url,
    external_link: data.external_link || data.source_url || data.link,
    hosting_type: data.hosting_type || 'hosted',
    is_published: data.is_published !== undefined ? data.is_published : true,
    created_at: data.created_at,
    updated_at: data.updated_at,
    price: data.price,
    source_url: data.source_url,
    duration: data.duration,
    content_type: data.content_type,
    category_id: data.category_id,
    image: data.image,
    link: data.link,
    career_interests: data.career_interests || [],
    content: data.content,
    location: data.location,
  };
}

// Helper function for course progress sanitization
export function sanitizeCourseProgress(data: any): CourseProgress {
  return {
    id: data.id || '',
    user_id: data.user_id || '',
    course_id: data.course_id || '',
    progress: typeof data.progress === 'number' ? data.progress : 0,
    status: data.status || 'started',
    date_started: data.date_started,
    date_completed: data.date_completed,
    course_category: data.course_category
  };
}

// Helper function to generate a hash for a course to help identify duplicates
export function generateCourseHash(course: Partial<ScrapedCourse>): string {
  // Create a simple hash from the title and either external link or video embed URL
  const baseString = `${course.title || ''}_${course.external_link || course.video_embed_url || ''}`;
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    const char = baseString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36); // Convert to base36 for shorter string
}
