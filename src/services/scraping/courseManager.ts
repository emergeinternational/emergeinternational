
import { supabase } from "@/integrations/supabase/client";
import { ScrapedCourse, Course, generateCourseHash } from "../courseTypes";
import { canUpdateCourse } from "./courseScraperValidation";

// Get all pending scraped courses with duplicate information
export const getPendingScrapedCourses = async (): Promise<ScrapedCourse[]> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .select("*")
      .eq("is_reviewed", false)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error getting pending scraped courses:", error);
      return [];
    }
    
    return data as ScrapedCourse[];
  } catch (error) {
    console.error("Error in getPendingScrapedCourses:", error);
    return [];
  }
};

// Approve a scraped course
export const approveScrapedCourse = async (id: string): Promise<string | null> => {
  try {
    const { data: scrapedCourse, error: fetchError } = await supabase
      .from("scraped_courses")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError || !scrapedCourse) {
      console.error("Error fetching scraped course:", fetchError);
      return null;
    }
    
    const typedScrapedCourse = scrapedCourse as ScrapedCourse;
    
    // If it's flagged as a duplicate with high confidence, update existing course
    if (typedScrapedCourse.is_duplicate && 
        typedScrapedCourse.duplicate_confidence && 
        typedScrapedCourse.duplicate_confidence >= 90 && 
        typedScrapedCourse.duplicate_of) {
      
      // Update the existing course if needed
      if (await canUpdateCourse(typedScrapedCourse.duplicate_of)) {
        const { error: updateError } = await supabase
          .from("courses")
          .update({
            updated_at: new Date().toISOString()
          })
          .eq("id", typedScrapedCourse.duplicate_of);
          
        if (updateError) {
          console.error("Error updating existing course:", updateError);
        }
      }
      
      // Mark the scraped course as reviewed and approved
      await supabase
        .from("scraped_courses")
        .update({
          is_reviewed: true,
          is_approved: true
        })
        .eq("id", id);
        
      return typedScrapedCourse.duplicate_of;
    }
    
    // Create a new course from the scraped data ensuring required fields are present
    const courseData = {
      title: typedScrapedCourse.title,
      summary: typedScrapedCourse.summary || '',
      category: typedScrapedCourse.category,
      level: typedScrapedCourse.level,
      video_embed_url: typedScrapedCourse.video_embed_url || '',
      external_link: typedScrapedCourse.external_link || '',
      image_url: typedScrapedCourse.image_url || '',
      hosting_type: typedScrapedCourse.hosting_type,
      is_published: true,
      source_platform: typedScrapedCourse.scraper_source,
      source_url: typedScrapedCourse.external_link || typedScrapedCourse.video_embed_url || '',
      hash_identifier: typedScrapedCourse.hash_identifier || 
        generateCourseHash(typedScrapedCourse.title, typedScrapedCourse.scraper_source)
    };

    const { data: newCourse, error: insertError } = await supabase
      .from("courses")
      .insert(courseData)
      .select()
      .single();
    
    if (insertError) {
      console.error("Error creating new course:", insertError);
      return null;
    }
    
    // Mark the scraped course as reviewed and approved
    const { error: updateError } = await supabase
      .from("scraped_courses")
      .update({
        is_reviewed: true,
        is_approved: true
      })
      .eq("id", id);
    
    if (updateError) {
      console.error("Error updating scraped course:", updateError);
    }
    
    return newCourse.id;
  } catch (error) {
    console.error("Error in approveScrapedCourse:", error);
    return null;
  }
};

// Reject a scraped course
export const rejectScrapedCourse = async (id: string, reason: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("scraped_courses")
      .update({
        is_reviewed: true,
        is_approved: false,
        review_notes: reason
      })
      .eq("id", id);
    
    if (error) {
      console.error("Error rejecting scraped course:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in rejectScrapedCourse:", error);
    return false;
  }
};

// Get all courses that were automatically scraped from a specific source
export const getScrapedCoursesBySource = async (source: string): Promise<ScrapedCourse[]> => {
  try {
    const { data, error } = await supabase
      .from("scraped_courses")
      .select("*")
      .eq("scraper_source", source)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error getting courses by source:", error);
      return [];
    }
    
    return data as ScrapedCourse[];
  } catch (error) {
    console.error("Error in getScrapedCoursesBySource:", error);
    return [];
  }
};
