
import { supabase } from "@/integrations/supabase/client";
import { Course, ScrapedCourse, sanitizeCourseData } from "../courseTypes";

export async function logScraperActivity(functionName: string, results: any): Promise<void> {
  try {
    await supabase
      .from('automation_logs')
      .insert({
        function_name: functionName,
        results: results
      });
  } catch (error) {
    console.error('Error logging scraper activity:', error);
  }
}

export async function createVerifiedCourse(scrapedCourse: ScrapedCourse): Promise<string | null> {
  try {
    // Create course object from scraped course
    const courseData = {
      title: scrapedCourse.title,
      summary: scrapedCourse.summary,
      category: scrapedCourse.category,
      hosting_type: scrapedCourse.hosting_type,
      external_link: scrapedCourse.external_link,
      image_url: scrapedCourse.image_url,
      video_embed_url: scrapedCourse.video_embed_url,
      is_published: true,
      level: scrapedCourse.level || 'beginner'
    };

    // Insert as an explicitly typed object to avoid type errors
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: courseData.title,
        summary: courseData.summary,
        category: courseData.category,
        hosting_type: courseData.hosting_type,
        external_link: courseData.external_link,
        image_url: courseData.image_url,
        video_embed_url: courseData.video_embed_url,
        is_published: true,
        level: courseData.level || 'beginner'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating verified course:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in createVerifiedCourse:', error);
    return null;
  }
}
