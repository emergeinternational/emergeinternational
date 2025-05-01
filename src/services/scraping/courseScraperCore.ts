
import { supabase } from '@/integrations/supabase/client';

// Function to log scraper activity
const logScraperActivity = async (activity: string, details: any) => {
  try {
    await supabase.from('automation_logs').insert({
      function_name: 'course_scraper',
      results: {
        activity,
        ...details,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to log scraper activity:', error);
  }
};

// Base scraper class
export class CourseScraper {
  protected source: string;
  protected baseUrl: string;

  constructor(source: string, baseUrl: string) {
    this.source = source;
    this.baseUrl = baseUrl;
  }

  async scrape(): Promise<void> {
    try {
      await logScraperActivity('scrape_started', { 
        source: this.source,
        baseUrl: this.baseUrl 
      });
      
      const courses = await this.extractCourses();
      
      if (courses && courses.length > 0) {
        await this.saveCourses(courses);
        
        await logScraperActivity('scrape_completed', {
          source: this.source,
          coursesFound: courses.length
        });
      } else {
        await logScraperActivity('scrape_completed', {
          source: this.source,
          coursesFound: 0,
          message: 'No courses found'
        });
      }
    } catch (error) {
      await logScraperActivity('scrape_failed', {
        source: this.source,
        error: error.message
      });
      throw error;
    }
  }

  protected async extractCourses(): Promise<any[]> {
    throw new Error('Method extractCourses() must be implemented by subclass');
  }

  protected async saveCourses(courses: any[]): Promise<void> {
    try {
      // Map scraped courses to database schema
      const scrapedCourses = courses.map((course) => ({
        title: course.title,
        summary: course.description || course.summary,
        external_link: course.url,
        image_url: course.imageUrl || course.image_url,
        category: course.category || 'other',
        level: course.level || 'beginner',
        hosting_type: 'external',
        scraper_source: this.source,
        is_reviewed: false,
        is_approved: false
      }));

      // Save to database
      const { error } = await supabase
        .from('scraped_courses')
        .upsert(scrapedCourses, {
          onConflict: 'external_link',
          ignoreDuplicates: false
        });

      if (error) {
        await logScraperActivity('save_failed', {
          source: this.source,
          error: error.message
        });
        throw error;
      }

      await logScraperActivity('save_successful', {
        source: this.source,
        coursesSaved: scrapedCourses.length
      });
    } catch (error) {
      await logScraperActivity('save_failed', {
        source: this.source,
        error: error.message
      });
      throw error;
    }
  }

  protected formatCategory(category: string): CourseCategory {
    const categoryMap: Record<string, CourseCategory> = {
      'photography': 'photographer',
      'photo': 'photographer',
      'design': 'designer',
      'fashion design': 'designer',
      'fashion': 'designer',
      'modeling': 'model',
      'model': 'model',
      'video': 'videographer',
      'videography': 'videographer',
      'art': 'fine_artist',
      'music': 'musical_artist',
      'event': 'event_planner'
    };

    const normalizedCategory = category.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(categoryMap)) {
      if (normalizedCategory.includes(key)) {
        return value;
      }
    }
    
    return 'other';
  }

  protected formatLevel(level: string): CourseLevel {
    const levelMap: Record<string, CourseLevel> = {
      'beginner': 'beginner',
      'basic': 'beginner',
      'introductory': 'beginner',
      'introduction': 'beginner',
      'intermediate': 'intermediate',
      'advanced': 'advanced',
      'expert': 'expert',
      'professional': 'expert',
      'master': 'expert'
    };

    if (!level) return 'beginner';
    
    const normalizedLevel = level.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(levelMap)) {
      if (normalizedLevel.includes(key)) {
        return value;
      }
    }
    
    return 'beginner';
  }
}

export default CourseScraper;
