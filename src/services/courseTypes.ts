
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

// Additional types needed by other parts of the application
export interface Course {
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
  is_published?: boolean;
  price?: number;
}

export interface CourseProgress {
  id?: string;
  user_id?: string;
  course_id: string;
  progress: number;
  status: 'started' | 'completed' | 'abandoned';
  date_started: string;
  date_completed?: string;
  created_at?: string;
  updated_at?: string;
  course_category?: string;
}

// Alias for backward compatibility
export type CourseHostingType = HostingType;

// Helper functions for sanitization
export function sanitizeCourseData(data: any): Course {
  return {
    id: data.id,
    title: data.title,
    summary: data.summary,
    category: data.category,
    hosting_type: data.hosting_type,
    external_link: data.external_link,
    image_url: data.image_url,
    video_embed_url: data.video_embed_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_published: data.is_published,
    price: data.price
  };
}

export function sanitizeCourseProgress(data: any): CourseProgress {
  return {
    id: data.id,
    user_id: data.user_id,
    course_id: data.course_id,
    progress: data.progress,
    status: data.status,
    date_started: data.date_started,
    date_completed: data.date_completed,
    created_at: data.created_at,
    updated_at: data.updated_at,
    course_category: data.course_category
  };
}

export function sanitizeScrapedCourse(data: any): ScrapedCourse {
  return {
    id: data.id,
    title: data.title,
    summary: data.summary,
    category: data.category,
    hosting_type: data.hosting_type,
    external_link: data.external_link,
    image_url: data.image_url,
    video_embed_url: data.video_embed_url,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_approved: data.is_approved,
    is_reviewed: data.is_reviewed,
    review_notes: data.review_notes,
    scraper_source: data.scraper_source,
    level: data.level,
    hash_identifier: data.hash_identifier,
    is_duplicate: data.is_duplicate,
    duplicate_confidence: data.duplicate_confidence,
    duplicate_of: data.duplicate_of
  };
}

export function generateCourseHash(course: ScrapedCourse): string {
  // Create a hash based on title and external link to identify duplicates
  const titleHash = course.title ? course.title.toLowerCase().replace(/\s+/g, '') : '';
  const linkHash = course.external_link ? course.external_link.replace(/https?:\/\//i, '').replace(/www\./i, '') : '';
  return `${titleHash}-${linkHash}`;
}
