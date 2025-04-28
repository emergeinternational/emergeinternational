import { sanitizeScrapedCourse } from "./courseScraperHelpers";
import { submitScrapedCourse } from "../courseScraperService";

// Function to process course data and submit it for approval
export const processCourseData = async (courseData: any) => {
  try {
    // Basic validation - check for required fields
    if (!courseData.title || !courseData.category || !courseData.external_link || !courseData.hosting_type || !courseData.scraper_source) {
      console.warn("Missing required fields in course data:", courseData);
      return { success: false, message: "Missing required fields" };
    }

    // Check for potential duplicate courses based on title and source
    // const existingCourse = await findExistingCourse(courseData.title, courseData.scraper_source);
    // if (existingCourse) {
    //   console.log(`Potential duplicate course found: ${courseData.title}`);
    //   courseData.is_duplicate = true;
    //   courseData.duplicate_confidence = calculateConfidence(courseData, existingCourse);
    //   courseData.duplicate_of = existingCourse.id;
    // }

    const sanitizedCourse = sanitizeScrapedCourse(courseData);

    // Submit the scraped course for approval
    const submissionResult = await submitScrapedCourse({
      ...sanitizedCourse,
      title: sanitizedCourse.title || 'Untitled',
      category: sanitizedCourse.category || 'designer',
      external_link: sanitizedCourse.external_link || '',
      hosting_type: sanitizedCourse.hosting_type || 'external',
      scraper_source: sanitizedCourse.scraper_source || 'unknown',
      hash_identifier: sanitizedCourse.hash_identifier || 'default-hash'
    } as any);

    if (submissionResult) {
      console.log(`Course "${courseData.title}" submitted successfully with ID: ${submissionResult}`);
      return { success: true, message: `Course submitted successfully with ID: ${submissionResult}` };
    } else {
      console.error("Failed to submit course:", courseData);
      return { success: false, message: "Failed to submit course" };
    }

  } catch (error: any) {
    console.error("Error processing course data:", error);
    return { success: false, message: `Error processing course data: ${error.message}` };
  }
};

// Placeholder functions - implement these based on your data model
const findExistingCourse = async (title: string, source: string) => {
  // Implement logic to search for existing courses in your database
  return null; // Return null if no course is found
};

const calculateConfidence = (newCourse: any, existingCourse: any) => {
  // Implement logic to calculate the confidence level that the two courses are duplicates
  return 0.5; // Return a confidence score (0 to 1)
};
