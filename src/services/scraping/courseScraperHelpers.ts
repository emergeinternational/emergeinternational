
import { ScrapedCourse } from "../courseTypes";

// Sanitize scraped course data
export const sanitizeScrapedCourse = (course: Partial<ScrapedCourse>): Partial<ScrapedCourse> => {
  return {
    ...course,
    title: course.title?.trim(),
    summary: course.summary?.trim(),
    external_link: course.external_link?.trim(),
    image_url: course.image_url?.trim(),
    video_embed_url: course.video_embed_url?.trim(),
    hash_identifier: course.hash_identifier || `${course.scraper_source}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  };
};
