
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
  image?: string;
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
  image_url?: string;
  content_type?: string;
  category_id?: string;
  career_interests?: string[];
  video_embed_url?: string;
  external_link?: string;
  hosting_type?: CourseHostingType;
  is_published?: boolean;
  content?: string;
  location?: string;
  last_scraped_at?: string;
  is_locked?: boolean;
  locked_reason?: string;
  locked_until?: string;
  has_active_students?: boolean;
  is_approved?: boolean;
  scraper_source?: string;
}
