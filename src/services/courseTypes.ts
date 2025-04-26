
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
  progress: number; // Ensure this field is explicitly defined
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
