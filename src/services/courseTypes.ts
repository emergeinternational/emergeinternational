
// Adding missing types
import { UUID } from 'crypto';
import { supabase } from '@/integrations/supabase/client';

export type CourseCategory = 'development' | 'design' | 'business' | 'marketing' | 'photography' | 'music' | 'fashion';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type HostingType = 'external' | 'embedded';

// Basic course interface
export interface Course {
  id: string;
  title: string;
  summary?: string;
  category: CourseCategory;
  hosting_type: HostingType;
  external_link?: string;
  image_url?: string;
  video_embed_url?: string;
  created_at?: string;
  updated_at?: string;
  is_published: boolean;
  price?: number;
}

// Scraped course interface extends course 
export interface ScrapedCourse extends Omit<Course, 'is_published'> {
  is_approved: boolean;
  is_reviewed: boolean;
  review_notes?: string;
  scraper_source: string;
  level: CourseLevel;
  hash_identifier?: string;
  is_duplicate?: boolean;
  duplicate_confidence?: number;
  duplicate_of?: string;
}

// Generate a hash identifier for duplicate detection
export const generateCourseHash = (course: Partial<Course>): string => {
  // Simple hash generation based on title and summary
  const titleHash = course.title?.toLowerCase().replace(/\s+/g, '') || '';
  const summaryHash = course.summary?.substring(0, 50).toLowerCase().replace(/\s+/g, '') || '';
  return `${titleHash}-${summaryHash}`;
};

// Sanitize scraped course data
export const sanitizeScrapedCourse = (course: any): ScrapedCourse => {
  return {
    id: course.id || undefined,
    title: course.title || '',
    summary: course.summary || '',
    category: course.category || 'development',
    hosting_type: course.hosting_type || 'external',
    external_link: course.external_link || '',
    image_url: course.image_url || '',
    video_embed_url: course.video_embed_url || '',
    created_at: course.created_at || new Date().toISOString(),
    updated_at: course.updated_at || new Date().toISOString(),
    is_approved: typeof course.is_approved === 'boolean' ? course.is_approved : false,
    is_reviewed: typeof course.is_reviewed === 'boolean' ? course.is_reviewed : false,
    review_notes: course.review_notes || '',
    scraper_source: course.scraper_source || 'manual',
    level: course.level || 'beginner',
    hash_identifier: course.hash_identifier || generateCourseHash(course),
    is_duplicate: typeof course.is_duplicate === 'boolean' ? course.is_duplicate : false,
    duplicate_confidence: course.duplicate_confidence || 0,
    duplicate_of: course.duplicate_of || ''
  };
};
