

// Define our interfaces for education data
export interface EducationCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface EducationContent {
  id: string;
  category_id: string;
  title: string;
  summary?: string;
  content_type: string;
  source_url?: string;
  image_url?: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
  archive_date?: string;
  talent_type?: string;
  level?: string;
}

// Add interfaces for course progress and engagement
export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  course_category: string | null;
  date_started: string;
  date_completed: string | null;
  status: 'started' | 'completed';
}

export interface CourseEngagement {
  id: string;
  course_id: string;
  total_clicks: number;
  last_click_date: string;
}

export interface WeeklyContent {
  title: string;
  content: string;
}

// List of valid talent types as simple strings
export const TALENT_TYPES = [
  'models',
  'designers',
  'photographers',
  'videographers',
  'influencers',
  'entertainment'
] as const;

// Create a type from the array for better type safety
export type TalentType = typeof TALENT_TYPES[number];

