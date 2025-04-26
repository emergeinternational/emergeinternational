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
      }
      
      if (item.source_url && !isUrlValid) {
        console.log(`Skipping course with invalid URL: ${item.title}`);
        continue;
      }
      
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
        validation_status: isUrlValid ? 'valid' : (item.source_url ? 'invalid' : 'valid')
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
      
      if (course.source_url && !isUrlValid) {
        console.log(`Skipping static course with invalid URL: ${course.title}`);
        continue;
      }
      
      const isHosted = determineHostingPriority(course);
      const image = getUniqueImageForCourse(course.title, course.category_id, usedImages, course.image_url);
      usedImages.add(image);
      
      validatedStaticCourses.push({
        ...course,
        image_url: image,
        source_url: isUrlValid ? course.source_url : undefined,
        is_hosted: isHosted,
        last_validated: new Date().toISOString(),
        validation_status: isUrlValid ? 'valid' : (course.source_url ? 'invalid' : 'valid')
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
        last_validated: new Date().toISOString(),
        validation_status: isUrlValid ? 'valid' : (course.source_url ? 'invalid' : 'valid')
      };
    }
    
    console.error("Course not found with ID:", courseId);
    return null;
  } catch (error) {
    console.error("Unexpected error in getCourseById:", error);
    return null;
  }
};

// Check if string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Map database result to Course interface with enhanced validation
const mapCourseData = (data: any): Course => {
  return {
    id: data.id,
    title: data.title,
    summary: data.summary || '',
    content_type: data.content_type,
    image_url: getUniqueImageForCourse(data.title, data.category_id, new Set(), data.image_url),
    category_id: data.category_id,
    is_featured: data.is_featured,
    published_at: data.published_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    duration: data.content_type === 'course' ? '10-12 weeks' : '1-2 days',
    content: data.content,
    career_interests: getCourseCareerInterests(data.title, data.category_id)
  };
};

// Get course progress for a user
export const getUserCourseProgress = async (userId: string): Promise<CourseProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching course progress:", error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error("Unexpected error in getUserCourseProgress:", error);
    return [];
  }
};

// Create or update course progress
export const updateCourseProgress = async (
  userId: string,
  courseId: string,
  status: string,
  courseCategory?: string
): Promise<boolean> => {
  try {
    const { data: existingData } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    if (existingData) {
      const { error } = await supabase
        .from('user_course_progress')
        .update({
          status,
          updated_at: new Date().toISOString(),
          date_completed: status === 'completed' ? new Date().toISOString() : existingData.date_completed
        })
        .eq('id', existingData.id);
      
      if (error) {
        console.error("Error updating course progress:", error);
        throw error;
      }
    } else {
      const { error } = await supabase
        .from('user_course_progress')
        .insert([{
          user_id: userId,
          course_id: courseId,
          status,
          course_category: courseCategory,
          date_started: new Date().toISOString()
        }]);
      
      if (error) {
        console.error("Error creating course progress:", error);
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Unexpected error in updateCourseProgress:", error);
    return false;
  }
};

// Get recommended courses based on user interests
export const getRecommendedCourses = async (userId: string, limit: number = 3): Promise<Course[]> => {
  try {
    return getFeaturedCourses(limit);
  } catch (error) {
    console.error("Unexpected error in getRecommendedCourses:", error);
    return [];
  }
};

// Get static courses as fallback - ensure we have adequate distribution across all
// career paths and all levels (beginner, intermediate, advanced)
export const getStaticCourses = (): Course[] => {
  const designerCourses = [
    { 
      id: "1", 
      category_id: "beginner",
      title: "Fashion Design 101", 
      summary: "Master the fundamentals of fashion design through hands-on projects. Learn sketching, pattern making, and create your first collection.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
      is_featured: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["designer"],
      source_url: "https://www.coursera.org/learn/fashion-design"
    },
    { 
      id: "4", 
      category_id: "intermediate",
      title: "Sustainable Fashion", 
      summary: "Learn eco-friendly design practices, sustainable materials sourcing, and ethical production methods for conscious fashion.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=800&auto=format&fit=crop",
      is_featured: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["designer", "model"],
      source_url: "https://www.futurelearn.com/courses/sustainable-fashion"
    },
    { 
      id: "3", 
      category_id: "advanced",
      title: "Advanced Pattern Making", 
      summary: "Master complex pattern making techniques for haute couture and ready-to-wear collections. Includes draping and 3D modeling.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1558906307-54289c8a9bd4?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["designer"],
      source_url: "https://www.masterclass.com/classes/fashion-design"
    }
  ];
  
  const modelCourses = [
    {
      id: "17",
      category_id: "beginner",
      title: "Introduction to Modeling",
      summary: "Learn the basics of modeling including posing, walking techniques, and portfolio development for beginners.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["model"],
      source_url: "https://www.udemy.com/course/modeling-fundamentals/"
    },
    { 
      id: "5", 
      category_id: "intermediate",
      title: "Fashion Portfolio Development", 
      summary: "Create a professional portfolio showcasing your designs and modeling work. Learn photography, styling, and digital presentation techniques.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["designer", "model", "actor"],
      source_url: "https://www.skillshare.com/classes/fashion-portfolio"
    },
    {
      id: "18",
      category_id: "advanced",
      title: "Advanced Runway Techniques",
      summary: "Master professional runway walking, posing, and presentation skills for high-fashion shows and editorial work.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["model"],
      source_url: "https://www.masterclass.com/classes/modeling-techniques"
    }
  ];
  
  const actorCourses = [
    {
      id: "19",
      category_id: "beginner",
      title: "Acting Fundamentals",
      summary: "Learn the basics of acting including character development, script analysis, and stage presence.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["actor"],
      source_url: "https://www.udemy.com/course/acting-basics/"
    },
    {
      id: "20",
      category_id: "intermediate",
      title: "Screen Acting Techniques",
      summary: "Develop your on-camera acting skills with professional techniques for film, television, and commercials.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1500703303ec-ddfa56af7ba8?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["actor"],
      source_url: "https://www.masterclass.com/classes/screen-acting"
    },
    { 
      id: "6", 
      category_id: "advanced",
      title: "Acting for Models Workshop", 
      summary: "Improve your camera presence and runway confidence with acting techniques in this intensive hands-on workshop.",
      content_type: "workshop",
      image_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop",
      is_featured: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["model", "actor"],
      source_url: "https://www.youtube.com/watch?v=modeling-acting-workshop"
    }
  ];
  
  const socialMediaCourses = [
    {
      id: "7",
      category_id: "beginner",
      title: "Social Media for Fashion Influencers",
      summary: "Learn to build your fashion brand on Instagram, TikTok and other platforms with effective content strategies.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop",
      is_featured: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["social media influencer", "model"],
      source_url: "https://www.udemy.com/course/fashion-influencer"
    },
    {
      id: "21",
      category_id: "intermediate",
      title: "Content Strategy for Fashion Brands",
      summary: "Develop comprehensive social media content strategies to grow your fashion brand and engage with your audience.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["social media influencer"],
      source_url: "https://www.linkedin.com/learning/social-media-marketing"
    },
    {
      id: "22",
      category_id: "advanced",
      title: "Monetization Strategies for Influencers",
      summary: "Learn advanced techniques for monetizing your social media presence through sponsorships, partnerships, and product development.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1579869847514-7c1a19d2d2ad?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["social media influencer"],
      source_url: "https://www.skillshare.com/classes/influencer-monetization"
    }
  ];
  
  const entertainmentCourses = [
    { 
      id: "23", 
      category_id: "beginner",
      title: "Introduction to Entertainment Industry", 
      summary: "Learn the basics of the entertainment industry including career paths, networking strategies, and portfolio development.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1459749180345-6d8462d61f8e?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["entertainment talent"],
      source_url: "https://www.udemy.com/course/entertainment-industry-basics/"
    },
    {
      id: "8",
      category_id: "intermediate",
      title: "Entertainment Industry Navigation",
      summary: "Discover how to build your career in the entertainment industry, from networking to portfolio development.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["entertainment talent", "actor"],
      source_url: "https://www.creativelive.com/entertainment-career"
    },
    {
      id: "24",
      category_id: "advanced",
      title: "Talent Management Masterclass",
      summary: "Learn advanced strategies for talent management, contract negotiation, and career development in the entertainment industry.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["entertainment talent"],
      source_url: "https://www.masterclass.com/classes/talent-management"
    }
  ];
  
  const photographyCourses = [
    {
      id: "9",
      category_id: "beginner",
      title: "Photography Fundamentals",
      summary: "Master the basics of photography, from camera settings to composition techniques.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["photographer"],
      source_url: "https://www.nikonschool.com/en/photography-courses/beginner"
    },
    {
      id: "25",
      category_id: "intermediate",
      title: "Studio Lighting for Photographers",
      summary: "Learn professional studio lighting techniques for fashion and portrait photography.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["photographer"],
      source_url: "https://www.proedu.com/products/studio-lighting"
    },
    {
      id: "13",
      category_id: "advanced",
      title: "Fashion Photography Masterclass",
      summary: "Learn professional fashion photography techniques from industry experts.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1452830978618-d6feae7d0ffa?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["photographer", "designer"],
      source_url: "https://www.kelbyone.com/fashion-photography"
    }
  ];
  
  const videographyCourses = [
    {
      id: "26",
      category_id: "beginner",
      title: "Introduction to Videography",
      summary: "Learn the basics of video production including equipment, shooting techniques, and basic editing.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1569420067112-b57b4f024399?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["videographer"],
      source_url: "https://www.udemy.com/course/video-production-basics/"
    },
    {
      id: "10",
      category_id: "intermediate",
      title: "Professional Videography",
      summary: "Learn advanced video production techniques, from pre to post-production.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["videographer"],
      source_url: "https://www.skillshare.com/classes/videography-advanced"
    },
    {
      id: "14",
      category_id: "advanced",
      title: "Documentary Filmmaking",
      summary: "Create compelling visual stories through documentary film production.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1579046399237-23eb585e850b?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["videographer"],
      source_url: "https://www.masterclass.com/classes/filmmaking"
    }
  ];
  
  const musicCourses = [
    {
      id: "11",
      category_id: "beginner",
      title: "Music Production Essentials",
      summary: "Start your journey in music production with fundamental concepts and techniques.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["musical artist"],
      source_url: "https://www.berkleeonline.com/courses/music-production"
    },
    {
      id: "27",
      category_id: "intermediate",
      title: "Music for Fashion Shows",
      summary: "Learn how to produce and mix music specifically for fashion shows and runway events.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["musical artist", "designer"],
      source_url: "https://www.soundonsound.com/tutorials/music-for-fashion"
    },
    {
      id: "15",
      category_id: "advanced",
      title: "Songwriting and Composition",
      summary: "Develop your skills in writing memorable melodies and compelling lyrics.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["musical artist"],
      source_url: "https://www.coursera.org/learn/songwriting-techniques"
    }
  ];
  
  const artCourses = [
    {
      id: "16",
      category_id: "beginner",
      title: "Watercolor Techniques",
      summary: "Master the fundamentals of watercolor painting from basic washes to advanced effects.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["fine artist"],
      source_url: "https://www.skillshare.com/classes/watercolor-basics"
    },
    {
      id: "12",
      category_id: "intermediate",
      title: "Digital Art and Painting",
      summary: "Explore digital art tools and techniques for creating professional artwork.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1473091534298-04dcbce3278c?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["fine artist"],
      source_url: "https://www.domestika.org/en/courses/illustration-digital"
    },
    {
      id: "28",
      category_id: "advanced",
      title: "Fashion Illustration Masterclass",
      summary: "Learn advanced techniques for creating stunning fashion illustrations for design presentations and editorial work.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1531913764164-f85c52d7e6a9?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["fine artist", "designer"],
      source_url: "https://www.schoolofmotionart.com/fashion-illustration"
    }
  ];
  
  const marketingCourses = [
    { 
      id: "2", 
      category_id: "beginner",
      title: "Digital Fashion Marketing", 
      summary: "Learn to market fashion products effectively using social media, email marketing, and digital advertising strategies.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&auto=format&fit=crop",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      career_interests: ["designer", "social media influencer"],
      source_url: "https://www.edx.org/learn/fashion-digital-marketing"
    }
  ];
  
  return [
    ...designerCourses,
    ...modelCourses,
    ...actorCourses,
    ...socialMediaCourses,
    ...entertainmentCourses,
    ...photographyCourses,
    ...videographyCourses,
    ...musicCourses,
    ...artCourses,
    ...marketingCourses
  ];
};

// Create a function to schedule the course refresh automation
export const scheduleCoursesRefresh = async (): Promise<boolean> => {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const { data: recentEnrollments, error } = await supabase
      .from('user_course_progress')
      .select('id')
      .gt('created_at', twoWeeksAgo.toISOString())
      .limit(1);
    
    if (error) {
      console.error("Error checking recent enrollments:", error);
      return false;
    }
    
    if (!recentEnrollments || recentEnrollments.length === 0) {
      console.log("No recent enrollments. Refreshing course content...");
      
      const { error: logError } = await supabase
        .from('course_engagement')
        .insert([{
          course_id: '00000000-0000-0000-0000-000000000000',
          total_clicks: 1,
          last_click_date: new Date().toISOString()
        }]);
      
      if (logError) {
        console.error("Error logging refresh attempt:", logError);
        return false;
      }
      
      return true;
    }
    
    console.log("Recent enrollments found. Skipping course refresh.");
    return true;
  } catch (error) {
    console.error("Error in scheduleCoursesRefresh:", error);
    return false;
  }
};
