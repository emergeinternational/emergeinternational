
// This is a wrapper file that re-exports functionality from the refactored module
// to maintain backward compatibility

export {
  submitScrapedCourse,
  getPendingScrapedCourses,
  approveScrapedCourse,
  rejectScrapedCourse,
  getDuplicateStats,
  triggerManualScrape
} from './scraping/courseScraperCore';

export {
  canUpdateCourse,
  checkDuplicateCourse,
  sanitizeScrapedCourse
} from './scraping/courseScraperValidation';

export {
  logScraperActivity,
  createVerifiedCourse
} from './scraping/courseScraperHelpers';
