// This file re-exports functionality from the refactored service files
// to maintain backward compatibility with existing imports
export { 
  getCourseById,
  getPopularCourses,
  getAllCourses,
  getStaticCourses,
  getCoursesWithProgress,
  getCoursesForCategory,
  trackCourseEngagement,
  getEligibleUsers,
  updateCertificateApproval
} from './courseDataService';

export {
  getUserCourseProgress,
  updateCourseProgress,
  getCourseProgress,
  calculateCourseCompletion
} from './courseProgressService';

export {
  submitScrapedCourse,
  getPendingScrapedCourses,
  approveScrapedCourse,
  rejectScrapedCourse,
  getScrapedCoursesBySource,
  getDuplicateStats
} from './scraping/courseScraperCore';

export {
  canUpdateCourse,
  checkDuplicateCourse
} from './scraping/courseScraperValidation';

export {
  logScraperActivity,
  createVerifiedCourse
} from './scraping/courseScraperHelpers';

export type { Course, CourseProgress, Category, Review } from './courseTypes';

// Also export certificate-related types and functions
export {
  generateCertificate,
  getUserCertificates,
  downloadCertificate,
  getCertificateSettings,
  updateCertificateSettings,
  userMeetsRequirements
} from './certificate/index';

export type {
  CertificateSettings,
  UserCertificate,
  CertificateEligibility
} from './certificate/index';
