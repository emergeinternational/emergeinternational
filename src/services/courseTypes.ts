
export type CourseCategory = 'model' | 'designer' | 'photographer' | 'videographer' | 'musical_artist' | 'fine_artist' | 'event_planner';
export type CourseLevel = 'beginner' | 'intermediate' | 'expert';
export type CourseHostingType = 'hosted' | 'embedded' | 'external';

export interface Course {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  category: CourseCategory;
  level: CourseLevel;
  duration?: string;
  instructor?: string;
  link?: string;
  slug?: string;
  rating?: number;
  reviews?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  prerequisites?: string[];
  created_at?: string;
  updated_at?: string;
  source_url?: string;
  image_url: string;
  content_type?: string;
  category_id?: string;
  career_interests?: string[];
  video_embed_url?: string;
  external_link?: string;
  hosting_type: CourseHostingType;
  is_published?: boolean;
  content?: string;
  location?: string;
}

export interface ScrapedCourse extends Omit<Course, 'id'> {
  id: string;
  scraper_source: string;
  is_reviewed: boolean;
  is_approved: boolean;
  review_notes?: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  status: 'not_started' | 'started' | 'in_progress' | 'completed';
  date_started?: string;
  date_completed?: string;
  course_category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  course_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}
