
export type CourseCategory = 'model' | 'designer' | 'photographer' | 'videographer' | 'musical_artist' | 'fine_artist' | 'event_planner';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels';
export type CourseHostingType = 'hosted' | 'external' | 'embedded';

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
  // Adding these properties to fix errors in Education and CourseDetail pages
  source_url?: string;
  link?: string;
  image?: string;
  content_type?: string;
  duration?: string;
  career_interests?: string[];
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
  hash_identifier: string;
  is_reviewed: boolean;
  is_approved: boolean;
  review_notes?: string;
  created_at?: string;
  updated_at?: string;
  is_duplicate?: boolean;
  duplicate_confidence?: number;
  duplicate_of?: string;
}

// Adding CourseProgress interface that's missing
export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  status: string;
  date_started?: string;
  date_completed?: string;
  created_at?: string;
  updated_at?: string;
  course_category?: string;
}

// Helper functions referenced in other files
export const sanitizeCourseData = (course: any): Course => {
  return {
    ...course,
    title: course.title?.trim() || "",
    summary: course.summary?.trim(),
    external_link: course.external_link?.trim(),
    image_url: course.image_url?.trim(),
    video_embed_url: course.video_embed_url?.trim(),
  };
};

export const sanitizeCourseProgress = (progress: any): CourseProgress => {
  return {
    ...progress,
    progress: Number(progress.progress) || 0,
    status: progress.status || 'started'
  };
};
