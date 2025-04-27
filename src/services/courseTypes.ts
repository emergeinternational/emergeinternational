export type CourseCategory = 'model' | 'designer' | 'photographer' | 'videographer' | 'musical_artist' | 'fine_artist' | 'event_planner';
export type CourseLevel = 'beginner' | 'intermediate' | 'expert';
export type CourseHostingType = 'hosted' | 'embedded' | 'external';

export interface Course {
  id: string;
  title: string;
  summary?: string;
  description?: string;
  category: CourseCategory;
  level: CourseLevel;
  duration?: string;
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
  image?: string;
  content_type?: string;
  category_id?: string;
  career_interests?: string[];
  video_embed_url?: string;
  external_link?: string;
  hosting_type: CourseHostingType;
  is_published?: boolean;
  content?: string;
  location?: string;
  price?: number;
  source_id?: string;
  source_platform?: string;
  hash_identifier?: string;
}

export interface ScrapedCourse extends Omit<Course, 'id'> {
  id: string;
  scraper_source: string;
  is_reviewed: boolean;
  is_approved: boolean;
  review_notes?: string;
  is_duplicate?: boolean;
  duplicate_of?: string;
  duplicate_confidence?: number;
  hash_identifier: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  status: 'not_started' | 'started' | 'in_progress' | 'completed';
  date_started?: string;
  date_completed?: string;
  course_category?: string;
  created_at?: string;
  updated_at?: string;
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
  comment?: string;
  created_at: string;
}

export const getDefaultCourseCategory = (category?: string): CourseCategory => {
  const validCategories: CourseCategory[] = ['model', 'designer', 'photographer', 'videographer', 'musical_artist', 'fine_artist', 'event_planner'];
  return validCategories.includes(category as CourseCategory) ? (category as CourseCategory) : 'model';
};

export const getDefaultCourseLevel = (level?: string): CourseLevel => {
  const validLevels: CourseLevel[] = ['beginner', 'intermediate', 'expert'];
  return validLevels.includes(level as CourseLevel) ? (level as CourseLevel) : 'beginner';
};

export const getDefaultHostingType = (type?: string): CourseHostingType => {
  const validTypes: CourseHostingType[] = ['hosted', 'embedded', 'external'];
  return validTypes.includes(type as CourseHostingType) ? (type as CourseHostingType) : 'hosted';
};

export const generateCourseHash = (title: string, source?: string): string => {
  const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, '');
  const normalizedSource = (source || '').toLowerCase().trim();
  return `${normalizedTitle}-${normalizedSource}`;
};

export const sanitizeCourseData = (data: any): Course => {
  const sourceUrl = data.source_url || data.external_link || '';
  const sourcePlatform = data.source_platform || data.scraper_source || '';
  
  return {
    id: data.id || '',
    title: data.title || 'Coming Soon',
    summary: data.summary || '',
    description: data.description || '',
    category: getDefaultCourseCategory(data.category || data.category_id),
    level: getDefaultCourseLevel(data.level || data.content_type),
    duration: data.duration || '',
    image_url: data.image_url || '',
    image: data.image_url || '',
    source_url: sourceUrl,
    content_type: data.content_type || '',
    category_id: data.category_id || '',
    created_at: data.created_at || '',
    updated_at: data.updated_at || '',
    career_interests: data.career_interests || [],
    video_embed_url: data.video_embed_url || data.source_url || '',
    external_link: data.external_link || data.source_url || '',
    hosting_type: getDefaultHostingType(data.hosting_type),
    is_published: data.is_published !== undefined ? data.is_published : true,
    price: data.price || 0,
    source_id: data.source_id || '',
    source_platform: sourcePlatform,
    hash_identifier: data.hash_identifier || generateCourseHash(data.title || 'Coming Soon', sourcePlatform)
  };
};

export const sanitizeCourseProgress = (data: any): CourseProgress => {
  const validStatuses = ['not_started', 'started', 'in_progress', 'completed'];
  const status = validStatuses.includes(data.status) ? data.status : 'not_started';
  
  return {
    id: data.id || '',
    user_id: data.user_id || '',
    course_id: data.course_id || '',
    progress: typeof data.progress === 'number' ? data.progress : 0,
    status: status as 'not_started' | 'started' | 'in_progress' | 'completed',
    date_started: data.date_started || null,
    date_completed: data.date_completed || null,
    course_category: data.course_category || null,
    created_at: data.created_at || null,
    updated_at: data.updated_at || null
  };
};
