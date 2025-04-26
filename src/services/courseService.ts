import { supabase } from "@/integrations/supabase/client";

// Define interfaces based on actual database schema
export interface Course {
  id: string;
  title: string;
  summary?: string;
  content_type: string;
  image_url?: string;
  category_id: string;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
  levelName?: string;
  duration?: string;
  content?: string;
  source_url?: string;
  career_interests?: string[];
  is_hosted?: boolean; // Indicates if the course is hosted directly on our platform
  last_validated?: string; // Date when the URL was last validated
  validation_status?: 'valid' | 'invalid' | 'pending'; // Status of URL validation
  is_placeholder?: boolean; // Indicates if this is a placeholder for a future course
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  status: string;
  date_started: string;
  date_completed?: string;
  course_category?: string;
  created_at: string;
  updated_at: string;
}

// Enhanced URL validation to ensure courses lead to real, accessible content
const validateUrl = async (url?: string): Promise<boolean> => {
  if (!url) return false;
  
  // Basic format validation
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    
    // Check for obviously invalid URLs
    if (url.includes('example.com') || 
        url.includes('placeholder') || 
        url.includes('undefined') ||
        url.includes('null')) {
      return false;
    }
    
    // Validate allowed domains (whitelist approach)
    const validDomains = [
      'coursera.org',
      'edx.org',
      'udemy.com',
      'skillshare.com',
      'youtube.com',
      'youtu.be',
      'khanacademy.org',
      'linkedin.com',
      'futurelearn.com',
      'domestika.org',
      'masterclass.com',
      'creativelive.com',
      'udacity.com',
      'pluralsight.com',
      'alison.com',
      'proedu.com',
      'schoolofmotionart.com',
      'kelbyone.com',
      'nikonschool.com',
      'soundonsound.com',
      'berkleeonline.com'
    ];
    
    // Extract domain from URL for validation
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const domain = urlObj.hostname.replace('www.', '');
    
    // Check if the domain is in our whitelist
    const isDomainValid = validDomains.some(validDomain => domain.includes(validDomain));
    if (!isDomainValid) {
      console.log(`Domain not in whitelist: ${domain}`);
      return false;
    }
    
    // For highest accuracy, we could perform a HEAD request to verify the URL is accessible
    // However, this would require a server-side function or edge function due to CORS limitations
    // This would be implemented in the course refresh automation system
    
    return true;
  } catch (e) {
    console.error("URL validation error:", e);
    return false;
  }
};

// Determine if a course should be hosted directly or linked externally
const determineHostingPriority = (course: any): boolean => {
  // If the source is YouTube, we can embed it
  if (course.source_url && 
     (course.source_url.includes('youtube.com') || course.source_url.includes('youtu.be'))) {
    return true;
  }
  
  // If the course has content, it can be hosted directly
  if (course.content && course.content.length > 0) {
    return true;
  }
  
  // Otherwise, use external linking
  return false;
};

// Get courses with optional filtering and enhanced validation
export const getCourses = async (
  categoryId?: string,
  limit: number = 10,
  featuredOnly: boolean = false,
  careerInterest?: string
): Promise<Course[]> => {
  try {
    let query = supabase
      .from('education_content')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(limit);
    
    if (categoryId && categoryId !== 'all') {
      query = query.eq('category_id', categoryId);
    }
    
    if (featuredOnly) {
      query = query.eq('is_featured', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching courses:", error);
      throw error;
    }
    
    const usedImages = new Set<string>();
    const validatedCourses = [];
    
    for (const item of data) {
      let isUrlValid = false;
      
      if (item.source_url) {
        isUrlValid = await validateUrl(item.source_url);
        // Update validation status in database if needed (this is non-blocking)
        if (isUrlValid !== (item.validation_status === 'valid')) {
          supabase
            .from('education_content')
            .update({ 
              validation_status: isUrlValid ? 'valid' : 'invalid',
              updated_at: new Date().toISOString() 
            })
            .eq('id', item.id)
            .then(() => {
              console.log(`Updated course ${item.id} validation status to ${isUrlValid ? 'valid' : 'invalid'}`);
            })
            .catch(err => {
              console.error(`Failed to update course validation status: ${err}`);
            });
        }
      }
      
      // Determine if this should be a placeholder
      const isPlaceholder = !isUrlValid && item.source_url;
      
      const isHosted = determineHostingPriority(item);
      
      const image = getUniqueImageForCourse(item.title, item.category_id, usedImages, item.image_url);
      usedImages.add(image);
      
      validatedCourses.push({
        id: item.id,
        title: item.title,
        summary: item.summary || '',
        content_type: item.content_type,
        image_url: image,
        category_id: item.category_id,
        is_featured: item.is_featured,
        published_at: item.published_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        duration: item.content_type === 'course' ? '10-12 weeks' : '1-2 days',
        source_url: isUrlValid ? item.source_url : undefined,
        is_hosted: isHosted,
        career_interests: getCourseCareerInterests(item.title, item.category_id),
        last_validated: new Date().toISOString(),
        validation_status: isUrlValid ? 'valid' : (item.source_url ? 'invalid' : 'valid'),
        is_placeholder: isPlaceholder || item.is_placeholder
      });
    }
    
    if (careerInterest && careerInterest !== 'all') {
      const filteredCourses = validatedCourses.filter(course => 
        course.career_interests?.includes(careerInterest)
      );
      return filteredCourses;
    }
    
    return validatedCourses;
  } catch (error) {
    console.error("Unexpected error in getCourses:", error);
    
    let staticCourses = getStaticCourses();
    
    const validatedStaticCourses = [];
    const usedImages = new Set<string>();
    
    for (const course of staticCourses) {
      const isUrlValid = await validateUrl(course.source_url);
      const isPlaceholder = !isUrlValid && course.source_url;
      
      const isHosted = determineHostingPriority(course);
      const image = getUniqueImageForCourse(course.title, course.category_id, usedImages, course.image_url);
      usedImages.add(image);
      
      validatedStaticCourses.push({
        ...course,
        image_url: image,
        source_url: isUrlValid ? course.source_url : undefined,
        is_hosted: isHosted,
        last_validated: new Date().toISOString(),
        validation_status: isUrlValid ? 'valid' : (course.source_url ? 'invalid' : 'valid'),
        is_placeholder: isPlaceholder
      });
    }
    
    let filteredStaticCourses = validatedStaticCourses;
    
    if (categoryId && categoryId !== 'all') {
      filteredStaticCourses = filteredStaticCourses.filter(course => course.category_id === categoryId);
    }
    
    if (careerInterest && careerInterest !== 'all') {
      filteredStaticCourses = filteredStaticCourses.filter(course => 
        course.career_interests?.includes(careerInterest)
      );
    }
    
    return filteredStaticCourses;
  }
};

// Helper function to validate URLs - this is a simplified version of the more comprehensive validateUrl function
const isValidUrl = (url?: string): boolean => {
  if (!url) return false;
  
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`);
    return url !== 'example.com' && 
           !url.includes('placeholder') && 
           !url.includes('undefined') &&
           !url.includes('null');
  } catch (e) {
    return false;
  }
};

// Get unique image for course based on title, category, and already used images
// This function ensures no duplicate images across courses
const getUniqueImageForCourse = (
  title: string, 
  category: string, 
  usedImages: Set<string>, 
  defaultImage?: string
): string => {
  if (defaultImage && 
      defaultImage !== 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop' && 
      !usedImages.has(defaultImage)) {
    return defaultImage;
  }
  
  const titleLower = title.toLowerCase();
  
  const photographyImages = [
    'https://images.unsplash.com/photo-1506901437675-cde80ff9c746?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1452830978618-d6feae7d0ffa?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520390138845-fd2d229dd553?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop'
  ];
  
  const videographyImages = [
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579046399237-23eb585e850b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492683962492-deef0ec456c0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1569420067112-b57b4f024399?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1575318634028-6a0cfcb60c6b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1527142879-95b61a0b8226?w=800&auto=format&fit=crop'
  ];
  
  const musicImages = [
    'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511379938547-c1f69419cd14?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&auto=format&fit=crop'
  ];
  
  const artImages = [
    'https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531913764164-f85c52d7e6a9?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558591710-d09badcd78c1?w=800&auto=format&fit=crop'
  ];
  
  const designImages = [
    'https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558906307-54289c8a9bd4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595062584313-44e69e3ef863?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494578379344-d6c710782a3d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1605289355680-75fb41239154?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1621600411688-4be93c2c1208?w=800&auto=format&fit=crop'
  ];
  
  const modelingImages = [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1492321936769-b49830bc1d1e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533561797500-4fad4750814e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop'
  ];
  
  const actingImages = [
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516967124779-c97d3d27a1d4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1560457079-9a6532ccb118?w=800&auto=format&fit=crop'
  ];
  
  const socialMediaImages = [
    'https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516321165247-4aa89df6ea2b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579869847514-7c1a19d2d2ad?w=800&auto=format&fit=crop'
  ];
  
  const entertainmentImages = [
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1459749180345-6d8462d61f8e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1516967124779-c97d3d27a1d4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549834146-0566ba0424e6?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop'
  ];
  
  const beginnerImages = [
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop'
  ];
  
  const intermediateImages = [
    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&auto=format&fit=crop'
  ];
  
  const advancedImages = [
    'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1487611459768-bd414656ea10?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1590650153855-d9e808231d41?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&auto=format&fit=crop'
  ];
  
  let possibleImages: string[] = [];
  
  if (titleLower.includes('photo') || titleLower.includes('camera') || titleLower.includes('photography')) {
    possibleImages = [...photographyImages];
  } 
  else if (titleLower.includes('video') || titleLower.includes('film') || titleLower.includes('cinematography')) {
    possibleImages = [...videographyImages];
  }
  else if (titleLower.includes('music') || titleLower.includes('audio') || titleLower.includes('sound')) {
    possibleImages = [...musicImages];
  }
  else if (titleLower.includes('paint') || titleLower.includes('art') || titleLower.includes('drawing')) {
    possibleImages = [...artImages];
  }
  else if (titleLower.includes('design') || titleLower.includes('fashion') || titleLower.includes('pattern')) {
    possibleImages = [...designImages];
  }
  else if (titleLower.includes('model') || titleLower.includes('portfolio') || titleLower.includes('runway')) {
    possibleImages = [...modelingImages];
  } 
  else if (titleLower.includes('act') || titleLower.includes('perform') || titleLower.includes('stage')) {
    possibleImages = [...actingImages];
  }
  else if (titleLower.includes('social') || titleLower.includes('media') || titleLower.includes('marketing')) {
    possibleImages = [...socialMediaImages];
  }
  else if (titleLower.includes('entertainment') || titleLower.includes('talent')) {
    possibleImages = [...entertainmentImages];
  }
  
  if (possibleImages.length === 0 || possibleImages.every(img => usedImages.has(img))) {
    if (category === 'beginner') {
      possibleImages = [...beginnerImages];
    } else if (category === 'intermediate') {
      possibleImages = [...intermediateImages];
    } else if (category === 'advanced') {
      possibleImages = [...advancedImages];
    }
  }
  
  for (const img of possibleImages) {
    if (!usedImages.has(img)) {
      return img;
    }
  }
  
  const randomId = Math.floor(Math.random() * 1000000);
  return `https://images.unsplash.com/photo-${randomId}-${Date.now()}?w=800&auto=format&fit=crop`;
};

// Get mock career interests for courses with expanded options
const getCourseCareerInterests = (title: string, category: string): string[] => {
  const titleLower = title.toLowerCase();
  const interests = new Set<string>();
  
  if (titleLower.includes('design') || titleLower.includes('fashion') || titleLower.includes('pattern')) {
    interests.add('designer');
  }
  
  if (titleLower.includes('model') || titleLower.includes('portfolio') || titleLower.includes('runway')) {
    interests.add('model');
  }
  
  if (titleLower.includes('act') || titleLower.includes('perform') || titleLower.includes('stage')) {
    interests.add('actor');
  }
  
  if (titleLower.includes('social') || titleLower.includes('media') || titleLower.includes('marketing')) {
    interests.add('social media influencer');
  }
  
  if (titleLower.includes('entertainment') || titleLower.includes('talent')) {
    interests.add('entertainment talent');
  }
  
  if (titleLower.includes('photo') || titleLower.includes('camera') || titleLower.includes('photography')) {
    interests.add('photographer');
  }
  
  if (titleLower.includes('video') || titleLower.includes('film') || titleLower.includes('cinematography')) {
    interests.add('videographer');
  }
  
  if (titleLower.includes('music') || titleLower.includes('audio') || titleLower.includes('sound')) {
    interests.add('musical artist');
  }
  
  if (titleLower.includes('paint') || titleLower.includes('art') || titleLower.includes('drawing')) {
    interests.add('fine artist');
  }
  
  if (interests.size === 0) {
    if (category === 'beginner') {
      const beginnerCareers = [
        'designer', 'model', 'photographer', 'videographer', 
        'actor', 'musical artist', 'fine artist', 
        'social media influencer', 'entertainment talent'
      ];
      const hash = titleLower.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      interests.add(beginnerCareers[hash % beginnerCareers.length]);
    } else if (category === 'intermediate') {
      const intermediateCareers = [
        'photographer', 'videographer', 'designer', 'model',
        'actor', 'musical artist', 'fine artist',
        'social media influencer', 'entertainment talent'
      ];
      const hash = titleLower.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      interests.add(intermediateCareers[hash % intermediateCareers.length]);
    } else if (category === 'advanced') {
      const advancedCareers = [
        'musical artist', 'fine artist', 'designer', 'model',
        'actor', 'photographer', 'videographer',
        'social media influencer', 'entertainment talent'
      ];
      const hash = titleLower.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      interests.add(advancedCareers[hash % advancedCareers.length]);
    } else {
      interests.add('designer');
      interests.add('model');
    }
  }
  
  return Array.from(interests);
};

// Get featured courses
export const getFeaturedCourses = async (limit: number = 3): Promise<Course[]> => {
  return getCourses(undefined, limit, true);
};

// Get a specific course by ID with enhanced validation
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    console.log("Getting course with ID:", courseId);
    
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      console.error("Invalid course ID provided:", courseId);
      return null;
    }
    
    if (isValidUUID(courseId)) {
      const { data, error } = await supabase
        .from('education_content')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) {
        console.error("Error fetching course:", error);
        return null;
      } else if (data) {
        const isUrlValid = await validateUrl(data.source_url);
        const isHosted = determineHostingPriority(data);
        
        return {
          ...mapCourseData(data),
          source_url: isUrlValid ? data.source_url : undefined,
          is_hosted: isHosted,
          last_validated: new Date().toISOString(),
          validation_status: isUrlValid ? 'valid' : (data.source_url ? 'invalid' : 'valid')
        };
      }
    }
    
    const allCourses = getStaticCourses();
    const course = allCourses.find(c => {
      const numericId = parseInt(courseId);
      return c.id === courseId || (!isNaN(numericId) && parseInt(c.id) === numericId);
    });
    
    if (course) {
      const isUrlValid = await validateUrl(course.source_url);
      const isHosted = determineHostingPriority(course);
      
      return {
        ...course,
        image_url: getUniqueImageForCourse(course.title, course.category_id, new Set(), course.image_url),
        source_url: isUrlValid ? course.source_url : undefined,
        is_hosted: isHosted,
        career_interests: getCourseCareerInterests(course.title, course.category_id),
        last_validated:
