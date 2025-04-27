export interface Course {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  category: string;
  level: string;
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
  hosting_type?: 'hosted' | 'embedded' | 'external';
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

export interface CourseProgress {
  id: string;
  course_id: string;
  user_id: string;
  status: string;
  course_category: string;
  date_started: string;
  date_completed: string;
  created_at: string;
  updated_at: string;
  progress: number;
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
  comment: string;
  created_at?: string;
}

export interface ScrapedCourse {
  id: string;
  title: string;
  summary?: string;
  category: 'model' | 'designer' | 'photographer' | 'videographer' | 'musical_artist' | 'fine_artist' | 'event_planner';
  level: 'beginner' | 'intermediate' | 'expert';
  video_embed_url?: string;
  external_link?: string;
  image_url?: string;
  hosting_type: 'hosted' | 'embedded' | 'external';
  scraper_source: string;
  is_approved: boolean;
  is_reviewed: boolean;
  review_notes?: string;
  created_at?: string;
  updated_at?: string;
}
