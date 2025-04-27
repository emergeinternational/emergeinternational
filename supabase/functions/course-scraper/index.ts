
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
  priority: number; // Priority for hosting courses (1 = highest, 3 = lowest)
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
  source_id?: string; // Identifier from the source platform
  hash_identifier?: string; // Hash for duplicate detection
}

// Generate a hash identifier for a course using its title and source
const generateCourseHash = (title: string, source: string): string => {
  const normalizedTitle = title.toLowerCase().trim().replace(/\s+/g, '');
  const normalizedSource = source.toLowerCase().trim();
  return `${normalizedTitle}-${normalizedSource}`;
};

// Course sources to scrape in priority order (host directly, then embed, then link)
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
    isActive: true,
    priority: 2 // Second priority - embedded videos
  },
  {
    name: "Vimeo Fashion Courses",
    type: "vimeo",
    endpoint: "https://api.vimeo.com/videos",
    categories: ["model", "designer", "photographer", "event_planner"],
    isActive: true,
    priority: 2 // Second priority - embedded videos
  },
  {
    name: "Alison Free Courses",
    type: "alison",
    endpoint: "https://alison.com/api/v1/courses",
    categories: ["designer", "photographer", "fine_artist"],
    isActive: true,
    priority: 3 // Third priority - external links
  },
  {
    name: "OpenLearn Free Courses",
    type: "openlearn",
    endpoint: "https://www.open.edu/openlearn/api/courses",
    categories: ["model", "fine_artist", "musical_artist"],
    isActive: true,
    priority: 3 // Third priority - external links
  },
  {
    name: "Coursera Free Courses",
    type: "coursera",
    endpoint: "https://api.coursera.org/api/courses.v1",
    categories: ["designer", "videographer", "event_planner"],
    isActive: false,  // Currently disabled
    priority: 3 // Third priority - external links
  },
  {
    name: "Emerge Original Content",
    type: "alison", // Using alison as placeholder type
    endpoint: "https://emerge-content-api.com/courses", // This would be your own API endpoint
    categories: ["model", "designer", "photographer", "videographer", "musical_artist", "fine_artist", "event_planner"],
    isActive: false, // Placeholder for your own course creation system
    priority: 1 // Highest priority - host directly
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

// Check if a course is a duplicate
const checkDuplicate = async (
  supabase: any,
  title: string,
  source: string,
  sourceUrl?: string
): Promise<{ isDuplicate: boolean; existingId?: string; confidence: number }> => {
  try {
    // Generate hash for course
    const courseHash = generateCourseHash(title, source);
    
    // First check existing courses table by hash
    const { data: existingCourses, error: coursesError } = await supabase
      .from("courses")
      .select("id, title")
      .eq("hash_identifier", courseHash)
      .limit(1);
    
    if (coursesError) {
      console.error("Error checking for duplicate in courses:", coursesError);
    } else if (existingCourses && existingCourses.length > 0) {
      return {
        isDuplicate: true,
        existingId: existingCourses[0].id,
        confidence: 100 // Exact match
      };
    }
    
    // Then check scraped courses table by hash
    const { data: scrapedCourses, error: scrapedError } = await supabase
      .from("scraped_courses")
      .select("id, title, is_reviewed, is_approved")
      .eq("hash_identifier", courseHash)
      .limit(1);
    
    if (scrapedError) {
      console.error("Error checking for duplicate in scraped courses:", scrapedError);
    } else if (scrapedCourses && scrapedCourses.length > 0) {
      // Found in scraped courses
      const scrapedCourse = scrapedCourses[0];
      
      // If it's already reviewed, consider it a duplicate
      if (scrapedCourse.is_reviewed) {
        return {
          isDuplicate: true,
          existingId: scrapedCourse.id,
          confidence: 100 // Exact match
        };
      }
    }
    
    // If we have a source URL, check for matching URLs
    if (sourceUrl) {
      const { data: urlMatches, error: urlError } = await supabase
        .from("courses")
        .select("id, title")
        .or(`source_url.eq.${sourceUrl},external_link.eq.${sourceUrl},video_embed_url.eq.${sourceUrl}`)
        .limit(1);
      
      if (urlError) {
        console.error("Error checking URL duplicates:", urlError);
      } else if (urlMatches && urlMatches.length > 0) {
        return {
          isDuplicate: true,
          existingId: urlMatches[0].id,
          confidence: 90 // Very high confidence
        };
      }
      
      // Also check scraped courses
      const { data: scrapedUrlMatches, error: scrapedUrlError } = await supabase
        .from("scraped_courses")
        .select("id, title, is_reviewed")
        .or(`external_link.eq.${sourceUrl},video_embed_url.eq.${sourceUrl}`)
        .limit(1);
      
      if (scrapedUrlError) {
        console.error("Error checking scraped URL duplicates:", scrapedUrlError);
      } else if (scrapedUrlMatches && scrapedUrlMatches.length > 0 && scrapedUrlMatches[0].is_reviewed) {
        return {
          isDuplicate: true,
          existingId: scrapedUrlMatches[0].id,
          confidence: 90 // Very high confidence
        };
      }
    }
    
    // If we get here, it's likely not a duplicate
    return { isDuplicate: false, confidence: 0 };
  } catch (error) {
    console.error("Error in checkDuplicate:", error);
    return { isDuplicate: false, confidence: 0 };
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
      scraper_source: "YouTube",
      source_id: `yt-${Date.now()}`
    }
  ];
  
  // Add hash identifier for duplicate detection
  return mockCourses.map(course => ({
    ...course,
    hash_identifier: generateCourseHash(course.title || '', course.scraper_source || '')
  })) as ScrapedCourseData[];
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
      scraper_source: "Vimeo",
      source_id: `vimeo-${Date.now()}`
    }
  ];
  
  // Add hash identifier for duplicate detection
  return mockCourses.map(course => ({
    ...course,
    hash_identifier: generateCourseHash(course.title || '', course.scraper_source || '')
  })) as ScrapedCourseData[];
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
      scraper_source: "Alison",
      source_id: `alison-${Date.now()}`
    }
  ];
  
  // Add hash identifier for duplicate detection
  return mockCourses.map(course => ({
    ...course,
    hash_identifier: generateCourseHash(course.title || '', course.scraper_source || '')
  })) as ScrapedCourseData[];
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
      scraper_source: "OpenLearn",
      source_id: `openlearn-${Date.now()}`
    }
  ];
  
  // Add hash identifier for duplicate detection
  return mockCourses.map(course => ({
    ...course,
    hash_identifier: generateCourseHash(course.title || '', course.scraper_source || '')
  })) as ScrapedCourseData[];
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
      scraper_source: "Coursera",
      source_id: `coursera-${Date.now()}`
    }
  ];
  
  // Add hash identifier for duplicate detection
  return mockCourses.map(course => ({
    ...course,
    hash_identifier: generateCourseHash(course.title || '', course.scraper_source || '')
  })) as ScrapedCourseData[];
};

// Run the scraper for a specific source
const runScraper = async (supabase: any, source: CourseSource): Promise<{
  success: boolean;
  count: number;
  duplicates: number;
  errors: any[];
}> => {
  const errors: any[] = [];
  let successCount = 0;
  let duplicateCount = 0;
  
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
        
        // Process each scraped course
        for (const course of scrapedCourses) {
          // Check if this course is a duplicate
          const sourceUrl = course.external_link || course.video_embed_url;
          const duplicateCheck = await checkDuplicate(
            supabase, 
            course.title, 
            course.scraper_source,
            sourceUrl
          );
          
          if (duplicateCheck.isDuplicate) {
            // It's a duplicate, log it and potentially skip
            duplicateCount++;
            
            await logScraperActivity(
              supabase,
              source.name,
              "duplicate_detected",
              "info",
              { 
                title: course.title,
                existingId: duplicateCheck.existingId,
                confidence: duplicateCheck.confidence 
              }
            );
            
            // If it's a high confidence duplicate, we might want to skip
            if (duplicateCheck.confidence >= 90) {
              // Skip adding to queue, but we could update the existing course if needed
              if (duplicateCheck.existingId && await canUpdateCourse(supabase, duplicateCheck.existingId)) {
                // Update logic would go here
              }
              continue;
            }
          }
          
          // Add to scraped courses queue - even if it's a potential duplicate
          // The admin can decide what to do with it
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
              source_id: course.source_id,
              hash_identifier: course.hash_identifier,
              is_approved: false,
              is_reviewed: false,
              // Add duplicate information if detected
              is_duplicate: duplicateCheck.isDuplicate,
              duplicate_confidence: duplicateCheck.confidence,
              duplicate_of: duplicateCheck.existingId
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
            { 
              category, 
              level, 
              count: scrapedCourses.length,
              duplicates: duplicateCount 
            }
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
    duplicates: duplicateCount,
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
    const requestBody = await req.json();
    const isScheduled = requestBody?.scheduled || false;
    const specificSource = requestBody?.sourceName || null;
    
    // Get active sources
    let activeSources = courseSources.filter(source => source.isActive);
    
    // If a specific source was requested, filter to just that one
    if (specificSource) {
      activeSources = activeSources.filter(source => 
        source.name.toLowerCase() === specificSource.toLowerCase()
      );
    }
    
    // Sort by priority (lower number = higher priority)
    activeSources.sort((a, b) => a.priority - b.priority);
    
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
    let totalScraped = 0;
    let totalDuplicates = 0;
    
    for (const source of activeSources) {
      console.log(`Starting scrape for source: ${source.name}`);
      const result = await runScraper(supabaseClient, source);
      results.push({
        source: source.name,
        priority: source.priority,
        ...result
      });
      
      totalScraped += result.count;
      totalDuplicates += result.duplicates;
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
        totalScraped,
        totalDuplicates,
        isScheduled,
        results
      }
    );
    
    // Return results
    return new Response(
      JSON.stringify({ 
        success: true, 
        timestamp: new Date().toISOString(),
        totalScraped,
        totalDuplicates,
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
