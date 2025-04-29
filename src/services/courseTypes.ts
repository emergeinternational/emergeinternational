export type CourseCategory =
  | 'design'
  | 'development'
  | 'marketing'
  | 'business'
  | 'freelancing';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export type HostingType = 'external' | 'internal';

export interface ScrapedCourse {
  id?: string;
  title: string;
  summary?: string;
  category: CourseCategory;
  hosting_type: HostingType;
  external_link?: string;
  image_url?: string;
  video_embed_url?: string;
  created_at?: string;
  updated_at?: string;
  is_approved?: boolean;
  is_reviewed?: boolean;
  review_notes?: string;
  scraper_source?: string;
  level?: CourseLevel;
  hash_identifier?: string;
  is_duplicate?: boolean;
  duplicate_confidence?: number;
  duplicate_of?: string;
}
