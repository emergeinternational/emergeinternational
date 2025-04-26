
import { supabase } from "@/integrations/supabase/client";

// Mapping of course themes to representative image URLs
const THEME_IMAGE_MAP: Record<string, string[]> = {
  'modeling': [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1612731596522-22dd49b2563b?w=800&auto=format&fit=crop'
  ],
  'music': [
    'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?w=800&auto=format&fit=crop'
  ],
  'fashion': [
    'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1584994831972-bba41dc18c7d?w=800&auto=format&fit=crop'
  ],
  'photography': [
    'https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542038784456-9747f21eb818?w=800&auto=format&fit=crop'
  ],
  'art': [
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1501975005899-387e9545ad1f?w=800&auto=format&fit=crop'
  ],
  'event': [
    'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519741497674-611481e2ccb9?w=800&auto=format&fit=crop'
  ]
};

export const determineCourseImageTheme = (title: string): string => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('model') || titleLower.includes('runway')) return 'modeling';
  if (titleLower.includes('song') || titleLower.includes('music')) return 'music';
  if (titleLower.includes('design') || titleLower.includes('fashion')) return 'fashion';
  if (titleLower.includes('photo')) return 'photography';
  if (titleLower.includes('paint') || titleLower.includes('art')) return 'art';
  if (titleLower.includes('event') || titleLower.includes('plan')) return 'event';
  
  return 'general';
};

export const validateAndUpdateCourseImage = async (courseId: string, title: string, currentImageUrl?: string) => {
  const theme = determineCourseImageTheme(title);
  
  // If no current image or current image isn't themed
  if (!currentImageUrl || !THEME_IMAGE_MAP[theme]?.some(img => img === currentImageUrl)) {
    const themeImages = THEME_IMAGE_MAP[theme] || THEME_IMAGE_MAP['general'];
    const newImageUrl = themeImages[Math.floor(Math.random() * themeImages.length)];
    
    try {
      const { error } = await supabase
        .from('education_content')
        .update({ 
          image_url: newImageUrl, 
          image_theme: theme,
          image_validated: true 
        })
        .eq('id', courseId);
      
      if (error) {
        console.error('Error updating course image:', error);
      }
      
      return newImageUrl;
    } catch (error) {
      console.error('Unexpected error in image validation:', error);
    }
  }
  
  return currentImageUrl;
};
