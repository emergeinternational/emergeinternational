
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

export type CourseHostingType = "hosted" | "external";

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
}
