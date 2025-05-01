
export type CourseCategory = 'development' | 'design' | 'business' | 'marketing' | 'education' | 'music' | 'art' | 'model' | 'designer' | 'photographer' | 'videographer' | 'musical_artist' | 'fine_artist' | 'event_planner';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export type HostingType = 'external' | 'hosted' | 'embedded';

export interface Course {
  id: string;
  title: string;
  summary?: string;
  category: CourseCategory;
  level?: CourseLevel;
  image_url?: string;
  video_embed_url?: string;
  external_link?: string;
  hosting_type: HostingType;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
  price?: number;
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
  hosting_type: HostingType;
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
