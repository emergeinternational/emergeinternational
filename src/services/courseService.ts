
// This file re-exports functionality from the refactored service files
// to maintain backward compatibility with existing imports
export { 
  getCourseById,
  getPopularCourses,
  getAllCourses,
  getStaticCourses,
  getCoursesWithProgress,
  getCoursesForCategory,
  getCourses,
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

export type { Course, CourseProgress, Category, Review } from './courseTypes';
