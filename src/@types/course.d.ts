
declare type CourseCategory = 
  | "model"
  | "designer"
  | "photographer" 
  | "videographer"
  | "musical_artist"
  | "fine_artist"
  | "event_planner"
  | "other";

declare type CourseLevel = "beginner" | "intermediate" | "expert" | "advanced";

declare type CourseHostingType = "hosted" | "external";

declare interface Course {
  id: string;
  title: string;
  summary?: string;
  category: CourseCategory;
  image_url?: string;
  price?: number;
  is_published: boolean;
  external_link?: string;
  video_embed_url?: string;
  hosting_type: CourseHostingType;
  created_at?: string;
  updated_at?: string;
}

declare interface ScrapedCourse {
  id: string;
  title: string;
  summary?: string;
  category: CourseCategory;
  level: CourseLevel;
  hosting_type: CourseHostingType;
  image_url?: string;
  external_link?: string;
  video_embed_url?: string;
  is_reviewed: boolean;
  is_approved: boolean;
  review_notes?: string;
  scraper_source: string;
  created_at?: string;
  updated_at?: string;
}
