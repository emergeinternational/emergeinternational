
export type CourseCategory =
  | "web_development"
  | "mobile_development"
  | "data_science"
  | "ui_design"
  | "digital_marketing"
  | "graphics_design"
  | "fashion_design"
  | "photography"
  | "model"
  | "designer"
  | "photographer"
  | "videographer"
  | "musical_artist"
  | "fine_artist"
  | "event_planner"
  | "other";

export type CourseLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type CourseHostingType = "hosted" | "external" | "embedded";

export interface Course {
  id: string;
  title: string;
  summary?: string;
  image_url?: string;
  video_embed_url?: string;
  external_link?: string;
  is_published: boolean;
  category: CourseCategory;
  level: CourseLevel;
  hosting_type: CourseHostingType;
  price?: number;
  created_at?: string;
  updated_at?: string;
  scraper_source?: string;
  source_url?: string; // Added to match usage in CourseDetail.tsx
  content?: string; // Added to match potential usage
  duration?: string; // Added to match usage in components
  career_interests?: string[]; // Added to match usage
  location?: string; // Added for potential location information
  image?: string; // Alternative image field
  category_id?: string; // Used in some components
  content_type?: string; // For different types of content
  link?: string; // Alternative URL field
}

export interface ScrapedCourse {
  id?: string;
  title: string;
  summary?: string;
  image_url?: string;
  video_embed_url?: string;
  external_link?: string;
  scraper_source: string;
  category: CourseCategory;
  level: CourseLevel;
  hosting_type: CourseHostingType;
  is_approved?: boolean;
  is_reviewed?: boolean;
  review_notes?: string;
  created_at?: string;
  updated_at?: string;
  // Add missing properties
  is_duplicate?: boolean;
  duplicate_confidence?: number;
}

export interface CourseProgress {
  id?: string;
  user_id: string;
  course_id: string;
  progress: number;
  status?: string;
  date_started?: string;
  date_completed?: string;
}
