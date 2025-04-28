
export type CourseCategory = 'model' | 'designer' | 'photographer' | 'videographer' | 'musical_artist' | 'fine_artist' | 'event_planner';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type CourseHostingType = 'hosted' | 'external';

export interface Course {
  id: string;
  title: string;
  summary?: string;
  category: CourseCategory;
  level?: CourseLevel;
  external_link?: string;
  video_embed_url?: string;
  image_url?: string;
  hosting_type: CourseHostingType;
  is_published: boolean;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ScrapedCourse {
  id: string;
  title: string;
  summary?: string;
  category: CourseCategory;
  level?: CourseLevel;
  external_link?: string;
  video_embed_url?: string;
  image_url?: string;
  hosting_type: CourseHostingType;
  scraper_source: string;
  hash_identifier: string; // Added missing field
  is_reviewed: boolean;
  is_approved: boolean;
  review_notes?: string;
  created_at?: string;
  updated_at?: string;
  is_duplicate?: boolean;
  duplicate_confidence?: number;
  duplicate_of?: string;
}
