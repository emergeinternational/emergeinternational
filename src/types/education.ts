
export type EducationLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseSource = 'internal' | 'external' | 'embedded';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type CompletionStatus = 'not_started' | 'in_progress' | 'completed';

export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  overview: string;
  description?: string;
  categoryId: string;
  level: EducationLevel;
  source: CourseSource;
  externalUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  content?: any;
  durationMinutes?: number;
  status: CourseStatus;
  featured: boolean;
  language: string;
}

export interface UserCourseEnrollment {
  id: string;
  userId: string;
  courseId: string;
  status: CompletionStatus;
  progressPercent: number;
  lastPosition?: string;
  startedAt: string;
  completedAt?: string;
}
