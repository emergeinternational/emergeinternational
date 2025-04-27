// Deno edge function for course scraping automation
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CourseSource {
  name: string;
  type: 'youtube' | 'vimeo' | 'alison' | 'openlearn' | 'coursera';
  endpoint: string;
  searchParams?: Record<string, string>;
  categories: string[];
  isActive: boolean;
}

interface ScrapedCourseData {
  title: string;
  summary: string;
  category: string;
  level: string;
  video_embed_url?: string;
  external_link?: string;
  image_url: string;
  hosting_type: 'embedded' | 'external';
  scraper_source: string;
}

// Course sources to scrape
const courseSources: CourseSource[] = [
  {
    name: "YouTube Fashion Education",
    type: "youtube",
    endpoint: "https://www.googleapis.com/youtube/v3/search",
    searchParams: {
      part: "snippet",
      maxResults: "10",
      type: "video",
      videoDuration: "medium",
    },
    categories: ["model", "designer", "photographer", "videographer"],
    isActive: true
  },
  {
    name: "Vimeo Fashion Courses",
    type: "vimeo",
    endpoint: "https://api.vimeo.com/videos",
    categories: ["model", "designer", "photographer", "event_planner"],
    isActive: true
  },
  {
    name: "Alison Free Courses",
    type: "alison",
    endpoint: "https://alison.com/api/v1/courses",
    categories: ["designer", "photographer", "fine_artist"],
    isActive: true
  },
  {
    name: "OpenLearn Free Courses",
    type: "openlearn",
    endpoint: "https://www.open.edu/openlearn/api/courses",
    categories: ["model", "fine_artist", "musical_artist"],
    isActive: true
  },
  {
    name: "Coursera Free Courses",
    type: "coursera",
    endpoint: "https://api.coursera.org/api/courses.v1",
    categories: ["designer", "videographer", "event_planner"],
    isActive: false  // Currently disabled
  }
];

// Enhanced logging function for scraper activity
const logScraperActivity = async (
  supabase: any,
  source: string,
  action: string,
  status: 'success' | 'warning' | 'error',
  details: any
) => {
  try {
    await supabase
      .from("automation_logs")
      .insert({
        function_name: `scraper:${source}`,
        executed_at: new Date().toISOString(),
        results: {
          action,
          status,
          details
        }
      });
  } catch (error) {
    console.error("Error logging scraper activity:", error);
  }
};

// Check if a course can be updated
const canUpdateCourse = async (supabase: any, courseId: string): Promise<boolean> => {
  // This logic mirrors the frontend function
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  // Check if course has active students with recent activity
  const { data, error } = await supabase
    .from("user_course_progress")
    .select("updated_at")
    .eq("course_id", courseId)
    .gt("updated_at", twoWeeksAgo.toISOString())
    .limit(1);
  
  if (error) {
    console.error("Error checking course status:", error);
    return false;
  }
  
  return !data || data.length === 0;
};

// Mock function to simulate scraping from YouTube
const scrapeYouTube = async (category: string, level: string): Promise<ScrapedCourseData[]> => {
  // In a real implementation, this would use the YouTube API
  // Here we're simulating the response
  
  const mockCourses: Partial<ScrapedCourseData>[] = [
    {
      title: `Fashion ${category.charAt(0).toUpperCase() + category.slice(1)} Fundamentals`,
      summary: `Learn the basics of fashion ${category} in this comprehensive course`,
      category,
      level,
      video_embed_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      image_url: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
      hosting_type: "embedded",
      scraper_source: "YouTube"
    }
  ];
  
  return mockCourses as ScrapedCourseData[];
};

// Mock function to simulate scraping from Vimeo
const scrapeVimeo = async (category: string, level: string): Promise<ScrapedCourseData[]> => {
  // In a real implementation, this would use the Vimeo API
  // Here we're simulating the response
  
  const mockCourses: Partial<ScrapedCourseData>[] = [
    {
      title: `Advanced ${category.charAt(0).toUpperCase() + category.slice(1)} Techniques`,
      summary: `Take your ${category} skills to the next level with professional techniques`,
      category,
      level,
      video_embed_url: "https://vimeo.com/123456789",
      image_url: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop",
      hosting_type: "embedded",
      scraper_source: "Vimeo"
    }
  ];
  
  return mockCourses as ScrapedCourseData[];
};

// Mock function to simulate scraping from Alison
const scrapeAlison = async (category: string, level: string): Promise<ScrapedCourseData[]> => {
  // In a real implementation, this would scrape from Alison's website
  // Here we're simulating the response
  
  const mockCourses: Partial<ScrapedCourseData>[] = [
    {
      title: `Professional ${category.charAt(0).toUpperCase() + category.slice(1)} Certificate Course`,
      summary: `Get certified in ${category} with this comprehensive program`,
      category,
      level,
      external_link: "https://alison.com/course/fashion-design",
      image_url: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=800&auto=format&fit=crop",
      hosting_type: "external",
      scraper_source: "Alison"
    }
  ];
  
  return mockCourses as ScrapedCourseData[];
};

// Mock function to simulate scraping from OpenLearn
const scrapeOpenLearn = async (category: string, level: string): Promise<ScrapedCourseData[]> => {
  // In a real implementation, this would scrape from OpenLearn's website
  // Here we're simulating the response
  
  const mockCourses: Partial<ScrapedCourseData>[] = [
    {
      title: `Introduction to ${category.charAt(0).toUpperCase() + category.slice(1)}`,
      summary: `A beginner-friendly introduction to ${category} concepts and practices`,
      category,
      level,
      external_link: "https://www.open.edu/openlearn/course/fashion",
      image_url: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop",
      hosting_type: "external",
      scraper_source: "OpenLearn"
    }
  ];
  
  return mockCourses as ScrapedCourseData[];
};

// Mock function to simulate scraping from Coursera
const scrapeCoursera = async (category: string, level: string): Promise<ScrapedCourseData[]> => {
  // In a real implementation, this would use the Coursera API
  // Here we're simulating the response
  
  const mockCourses: Partial<ScrapedCourseData>[] = [
    {
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Specialization`,
      summary: `Comprehensive specialization in ${category} with industry experts`,
      category,
      level,
      external_link: "https://www.coursera.org/specializations/fashion",
      image_url: "https://images.unsplash.com/photo-1571513800378-342135a7c18c?w=800&auto=format&fit=crop",
      hosting_type: "external",
      scraper_source: "Coursera"
    }
  ];
  
  return mockCourses as ScrapedCourseData[];
};

// Run the scraper for a specific source
const runScraper = async (supabase: any, source: CourseSource): Promise<{
  success: boolean;
  count: number;
  errors: any[];
}> => {
  const errors: any[] = [];
  let successCount = 0;
  
  // For each category supported by this source
  for (const category of source.categories) {
    // Scrape for different levels
    const levels = ['beginner', 'intermediate', 'expert'];
    
    for (const level of levels) {
      try {
        let scrapedCourses: ScrapedCourseData[] = [];
        
        // Call the appropriate scraper based on the source type
        switch(source.type) {
          case 'youtube':
            scrapedCourses = await scrapeYouTube(category, level);
            break;
          case 'vimeo':
            scrapedCourses = await scrapeVimeo(category, level);
            break;
          case 'alison':
            scrapedCourses = await scrapeAlison(category, level);
            break;
          case 'openlearn':
            scrapedCourses = await scrapeOpenLearn(category, level);
            break;
          case 'coursera':
            scrapedCourses = await scrapeCoursera(category, level);
            break;
        }
        
        // Add scraped courses to the queue
        for (const course of scrapedCourses) {
          const { error } = await supabase
            .from("scraped_courses")
            .insert({
              title: course.title,
              summary: course.summary,
              category: course.category,
              level: course.level,
              video_embed_url: course.video_embed_url,
              external_link: course.external_link,
              image_url: course.image_url,
              hosting_type: course.hosting_type,
              scraper_source: course.scraper_source,
              is_approved: false,
              is_reviewed: false
            });
          
          if (error) {
            errors.push({ course: course.title, error });
            await logScraperActivity(
              supabase,
              source.name,
              "insert_course",
              "error",
              { course: course.title, error }
            );
          } else {
            successCount++;
          }
        }
        
        // Log success
        if (scrapedCourses.length > 0) {
          await logScraperActivity(
            supabase,
            source.name,
            "scrape_courses",
            "success",
            { category, level, count: scrapedCourses.length }
          );
        }
      } catch (error) {
        errors.push({ category, level, error });
        await logScraperActivity(
          supabase,
          source.name,
          "scrape_courses",
          "error",
          { category, level, error: error.toString() }
        );
      }
    }
  }
  
  return {
    success: errors.length === 0,
    count: successCount,
    errors
  };
};

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Create Supabase client
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      auth: { persistSession: false },
    }
  );

  try {
    // Get active sources
    const activeSources = courseSources.filter(source => source.isActive);
    
    if (activeSources.length === 0) {
      await logScraperActivity(
        supabaseClient,
        "system",
        "scraper_check",
        "warning",
        { message: "No active scraper sources configured" }
      );

      return new Response(
        JSON.stringify({ success: false, message: "No active scraper sources configured" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
    
    // Run scrapers for each active source
    const results = [];
    const startTime = new Date().toISOString();
    
    for (const source of activeSources) {
      console.log(`Starting scrape for source: ${source.name}`);
      const result = await runScraper(supabaseClient, source);
      results.push({
        source: source.name,
        ...result
      });
    }
    
    // Log the overall scraping session
    await logScraperActivity(
      supabaseClient,
      "system",
      "scraping_session",
      "success",
      {
        startTime,
        endTime: new Date().toISOString(),
        results
      }
    );
    
    // Return results
    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp: new Date().toISOString(),
        results
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    // Log the error
    await logScraperActivity(
      supabaseClient,
      "system",
      "execute_scraper",
      "error",
      { error: error.toString() }
    );
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
