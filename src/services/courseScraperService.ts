
// This file is kept for backward compatibility and re-exports from the new structure
import { Course, ScrapedCourse, CourseCategory, CourseLevel, CourseHostingType } from "./courseTypes";
import { trackCourseEngagement } from "./courseDataService";
import { 
  canUpdateCourse,
  sanitizeScrapedCourse,
  checkDuplicateCourse
} from './scraping/courseScraperValidation';
import {
  submitScrapedCourse,
  getPendingScrapedCourses,
  approveScrapedCourse,
  rejectScrapedCourse,
  getScrapedCourses,
  getScrapedCoursesBySource,
  getDuplicateStats,
  triggerManualScrape
} from './scraping/courseScraperCore';
import {
  logScraperActivity,
  createVerifiedCourse
} from './scraping/courseScraperHelpers';

// Re-export all functions
export {
  // From validation
  canUpdateCourse,
  sanitizeScrapedCourse,
  checkDuplicateCourse,
  
  // From core
  submitScrapedCourse,
  getPendingScrapedCourses,
  approveScrapedCourse,
  rejectScrapedCourse,
  getScrapedCourses,
  getScrapedCoursesBySource,
  getDuplicateStats,
  triggerManualScrape,
  
  // From helpers
  logScraperActivity,
  createVerifiedCourse
};

// Also export related types
export type { Course, ScrapedCourse, CourseCategory, CourseLevel, CourseHostingType };
