
import { Course, CourseProgress } from "./courseTypes";
import { getUserCourseProgress } from "./courseProgressService";
import { getStaticCourses } from "./staticCoursesData";
import { 
  getCourseById as getCourseByIdQuery, 
  getAllCourses as getAllCoursesQuery,
  getPopularCourses as getPopularCoursesQuery
} from "./courseQueryService";

export { 
  getEligibleUsers,
  updateCertificateApproval 
} from './certificateService';

export { trackCourseEngagement } from './courseEngagementService';

export const getCourseById = getCourseByIdQuery;
export const getAllCourses = getAllCoursesQuery;
export const getPopularCourses = getPopularCoursesQuery;

export const getCoursesWithProgress = async (
  userId?: string
): Promise<(Course & { userProgress?: CourseProgress | null })[]> => {
  try {
    const courses = await getAllCourses();
    
    if (!userId) {
      return courses.map(course => ({ ...course, userProgress: null }));
    }

    const userProgress = await getUserCourseProgress(userId);
    
    return courses.map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        ...course,
        userProgress: progress || null
      };
    });
  } catch (error) {
    console.error("Error in getCoursesWithProgress:", error);
    return [];
  }
};

export const getCoursesForCategory = async (
  category: string,
  userId?: string
): Promise<(Course & { userProgress?: CourseProgress | null })[]> => {
  try {
    const courses = await getAllCourses();
    const categoryCourses = courses.filter(course => course.category === category);
    
    if (!userId) {
      return categoryCourses.map(course => ({ ...course, userProgress: null }));
    }

    const userProgress = await getUserCourseProgress(userId);
    
    return categoryCourses.map(course => {
      const progress = userProgress.find(p => p.course_id === course.id);
      return {
        ...course,
        userProgress: progress || null
      };
    });
  } catch (error) {
    console.error("Error in getCoursesForCategory:", error);
    return [];
  }
};

export { getStaticCourses };
