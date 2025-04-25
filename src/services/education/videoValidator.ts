
import { EducationContent } from './types';
import { supabase } from "@/integrations/supabase/client";

/**
 * Validates if a YouTube URL is working correctly
 * This runs in the browser and doesn't actually fetch the video,
 * but checks if the URL format is correct and extractable
 */
export const validateYoutubeUrl = (url?: string): boolean => {
  if (!url) return false;
  
  try {
    // Check for YouTube URL patterns
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(url)) {
      return false;
    }
    
    // Extract video ID based on URL format
    let videoId: string | null = null;
    
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?&#]/)[0];
    } else if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      videoId = urlParams.get('v');
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split(/[?&#]/)[0];
    }
    
    return !!videoId && videoId.length > 0;
  } catch (error) {
    console.error("Error validating YouTube URL:", error);
    return false;
  }
};

/**
 * Formats a YouTube URL into the proper embed format
 */
export const formatYoutubeEmbedUrl = (url: string): string | null => {
  try {
    let videoId: string | null = null;
    
    // Extract video ID based on URL format
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?&#]/)[0];
    } else if (url.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(url.split('?')[1] || '');
      videoId = urlParams.get('v');
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1]?.split(/[?&#]/)[0];
    }
    
    if (!videoId) return null;
    
    return `https://www.youtube.com/embed/${videoId}`;
  } catch (error) {
    console.error("Error formatting YouTube URL:", error);
    return null;
  }
};

/**
 * Scan education content for broken video links
 * This would typically be called on an admin panel or by a scheduled job
 */
export const scanVideoContent = async (): Promise<{
  total: number;
  valid: number;
  invalid: number;
  invalidItems: EducationContent[];
}> => {
  try {
    const { data, error } = await supabase
      .from('education_content')
      .select('*')
      .eq('content_type', 'video');
      
    if (error) {
      throw error;
    }
    
    const videoItems = data || [];
    const invalid: EducationContent[] = [];
    let validCount = 0;
    
    videoItems.forEach(item => {
      if (!item.source_url || !validateYoutubeUrl(item.source_url)) {
        invalid.push(item);
      } else {
        validCount++;
      }
    });
    
    return {
      total: videoItems.length,
      valid: validCount,
      invalid: invalid.length,
      invalidItems: invalid
    };
  } catch (error) {
    console.error("Error scanning video content:", error);
    return {
      total: 0,
      valid: 0,
      invalid: 0,
      invalidItems: []
    };
  }
};
