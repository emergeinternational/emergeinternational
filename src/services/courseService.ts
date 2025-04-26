import { supabase } from "@/integrations/supabase/client";

// Define interfaces based on actual database schema
export interface Course {
  id: string;
  title: string;
  summary: string;
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
  is_placeholder?: boolean;
  is_link_valid?: boolean;
  last_validation?: string;
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

// Get courses with optional filtering
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
    
    // Map database results to Course interface and ensure unique images
    const usedImages = new Set<string>();
    let courses = data.map(item => {
      // Get a unique image for each course
      const image = getUniqueImageForCourse(item.title, item.category_id, usedImages, item.image_url);
      usedImages.add(image);
      
      // Check if source_url is valid
      const isLinkValid = isValidUrl(item.source_url) && 
                         !item.source_url?.includes('example.com') &&
                         !item.source_url?.includes('placeholder');
      
      return {
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
        source_url: isLinkValid ? item.source_url : undefined,
        // Add career interests
        career_interests: getCourseCareerInterests(item.title, item.category_id),
        is_link_valid: isLinkValid,
        is_placeholder: !isLinkValid,
        last_validation: new Date().toISOString()
      };
    });
    
    // Convert invalid courses to placeholders instead of removing them
    courses = courses.map(course => {
      if (!course.source_url || 
          (course.source_url && 
           (!isValidUrl(course.source_url) || 
            course.source_url.includes('example.com') || 
            course.source_url.includes('placeholder')))) {
        return {
          ...course,
          is_placeholder: true,
          title: "New Course Coming Soon",
          summary: "We're preparing new educational content in this category. Check back soon for updates.",
          is_link_valid: false
        };
      }
      return course;
    });
    
    // If filtering by career interest is active, apply it
    if (careerInterest && careerInterest !== 'all') {
      courses = courses.filter(course => 
        course.career_interests?.includes(careerInterest)
      );
      
      // If no courses match the career interest, provide at least one placeholder
      if (courses.length === 0) {
        const placeholderCourse = createPlaceholderCourse(careerInterest);
        courses.push(placeholderCourse);
      }
    }
    
    // Ensure we always have at least one course or placeholder
    if (courses.length === 0) {
      courses.push(createPlaceholderCourse());
    }
    
    return courses;
  } catch (error) {
    console.error("Unexpected error in getCourses:", error);
    // Return placeholder courses on error to ensure the UI always has content
    return [createPlaceholderCourse()];
  }
};

// Create a placeholder course when needed
const createPlaceholderCourse = (careerInterest?: string): Course => {
  const id = `placeholder-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const categoryId = careerInterest ? careerInterest : 'beginner';
  
  return {
    id,
    title: "New Course Coming Soon",
    summary: "We're preparing new educational content for you. Check back soon for updates.",
    content_type: "course",
    image_url: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?w=800&auto=format&fit=crop",
    category_id: categoryId,
    is_featured: false,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    duration: "Coming soon",
    is_placeholder: true,
    is_link_valid: false,
    career_interests: careerInterest ? [careerInterest] : ["designer", "model"],
    last_validation: new Date().toISOString()
  };
};

// Helper function to validate URLs
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
const getUniqueImageForCourse = (
  title: string, 
  category: string, 
  usedImages: Set<string>, 
  defaultImage?: string
): string => {
  // If the default image is valid and not already used, use it
  if (defaultImage && 
      defaultImage !== 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop' && 
      !usedImages.has(defaultImage)) {
    return defaultImage;
  }
  
  const titleLower = title.toLowerCase();
  
  // Use separate image arrays for different categories to ensure diversity
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
    'https://images.unsplash.com/photo-1575318634028-6a0cfcb60c6b?w=800&auto=format&fit=crop'
  ];
  
  const musicImages = [
    'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1527142879-95b61a0b8226?w=800&auto=format&fit=crop'
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
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop',
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
    'https://images.unsplash.com/photo-1516967124798-10656f7dca28?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549834146-0566ba0424e6?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop'
  ];
  
  // Additional category-specific and level-specific images
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
  
  // Select which image array to use based on title and career interest
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
  
  // If no category-specific images matched or all are used, fall back to level-specific images
  if (possibleImages.length === 0 || possibleImages.every(img => usedImages.has(img))) {
    if (category === 'beginner') {
      possibleImages = [...beginnerImages];
    } else if (category === 'intermediate') {
      possibleImages = [...intermediateImages];
    } else if (category === 'advanced') {
      possibleImages = [...advancedImages];
    }
  }
  
  // Find the first image that hasn't been used
  for (const img of possibleImages) {
    if (!usedImages.has(img)) {
      return img;
    }
  }
  
  // If all possible images are used, create a unique URL with a timestamp and random ID
  // This ensures we never duplicate images even as a last resort
  const randomId = Math.floor(Math.random() * 1000000);
  return `https://images.unsplash.com/photo-${randomId}-${Date.now()}?w=800&auto=format&fit=crop`;
};

// Get mock career interests for courses with expanded options
const getCourseCareerInterests = (title: string, category: string): string[] => {
  const titleLower = title.toLowerCase();
  const interests = new Set<string>();
  
  // Add primary interest based on keywords in title
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
  
  // Ensure each course has at least one interest - distribute across categories based on level
  // This ensures we have courses distributed across all levels for each career category
  if (interests.size === 0) {
    if (category === 'beginner') {
      // Beginner courses distributed among all career types
      const beginnerCareers = [
        'designer', 'model', 'photographer', 'videographer', 
        'actor', 'musical artist', 'fine artist', 
        'social media influencer', 'entertainment talent'
      ];
      // Use hash of title to consistently assign the same career to the same course
      const hash = titleLower.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      interests.add(beginnerCareers[hash % beginnerCareers.length]);
    } else if (category === 'intermediate') {
      // Intermediate courses distributed among all career types
      const intermediateCareers = [
        'photographer', 'videographer', 'designer', 'model',
        'actor', 'musical artist', 'fine artist',
        'social media influencer', 'entertainment talent'
      ];
      const hash = titleLower.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      interests.add(intermediateCareers[hash % intermediateCareers.length]);
    } else if (category === 'advanced') {
      // Advanced courses distributed among all career types
      const advancedCareers = [
        'musical artist', 'fine artist', 'designer', 'model',
        'actor', 'photographer', 'videographer',
        'social media influencer', 'entertainment talent'
      ];
      const hash = titleLower.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      interests.add(advancedCareers[hash % advancedCareers.length]);
    } else {
      // Default case - generic distribution
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

// Get a specific course by ID
export const getCourseById = async (courseId: string): Promise<Course | null> => {
  try {
    console.log("Getting course with ID:", courseId);
    
    if (!courseId || courseId === 'undefined' || courseId === 'null') {
      console.error("Invalid course ID provided:", courseId);
      return null;
    }
    
    // First try to fetch from database using UUID
    if (isValidUUID(courseId)) {
      const { data, error } = await supabase
        .from('education_content')
        .select('*')
        .eq('id', courseId)
        .single();
      
      if (error) {
        console.error("Error fetching course:", error);
        // Continue to fallback options
      } else if (data) {
        // Check if URL is valid
        const isLinkValid = isValidUrl(data.source_url);
        
        // If URL is invalid, return the course as a placeholder
        if (!isLinkValid) {
          return {
            id: data.id,
            title: "New Course Coming Soon",
            summary: "We're preparing new educational content in this category. Check back soon for updates.",
            content_type: data.content_type,
            image_url: getUniqueImageForCourse("placeholder", data.category_id, new Set()),
            category_id: data.category_id,
            is_featured: data.is_featured,
            published_at: data.published_at,
            created_at: data.created_at,
            updated_at: data.updated_at,
            duration: data.content_type === 'course' ? '10-12 weeks' : '1-2 days',
            source_url: undefined,
            is_placeholder: true,
            is_link_valid: false,
            career_interests: getCourseCareerInterests(data.title, data.category_id),
            last_validation: new Date().toISOString()
          };
        }
        
        return mapCourseData(data);
      }
    }
    
    // If database fetch fails or invalid UUID, fall back to static courses
    const allCourses = getStaticCourses();
    const course = allCourses.find(c => {
      // Match by ID directly or by its numeric representation
      const numericId = parseInt(courseId);
      return c.id === courseId || (!isNaN(numericId) && parseInt(c.id.toString()) === numericId);
    });
    
    if (course) {
      // Check if URL is valid
      const isLinkValid = isValidUrl(course.source_url);
      
      // If URL is invalid, return a placeholder version of the course
      if (!isLinkValid) {
        return {
          ...course,
          title: "New Course Coming Soon",
          summary: "We're preparing new educational content in this category. Check back soon for updates.",
          image_url: getUniqueImageForCourse("placeholder", course.category_id, new Set()),
          source_url: undefined,
          is_placeholder: true,
          is_link_valid: false
        };
      }
      
      // Get a unique image for this course
      const uniqueImage = getUniqueImageForCourse(course.title, course.category_id, new Set(), course.image_url);
      
      return {
        ...course,
        image_url: uniqueImage,
        is_link_valid: true,
        is_placeholder: false,
        career_interests: getCourseCareerInterests(course.title, course.category_id)
      };
    }
    
    console.error("Course not found with ID:", courseId);
    // Return a placeholder course instead of null
    return createPlaceholderCourse();
  } catch (error) {
    console.error("Unexpected error in getCourseById:", error);
    // Return a placeholder course on error
    return createPlaceholderCourse();
  }
};

// Check if string is a valid UUID
const isValidUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Map database course to frontend course model
const mapCourseData = (data: any): Course => {
  return {
    id: data.id,
    title: data.title,
    summary: data.summary || '',
    content_type: data.content_type,
    image_url: data.image_url,
    category_id: data.category_id,
    is_featured: data.is_featured,
    published_at: data.published_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    duration: data.content_type === 'course' ? '10-12 weeks' : '1-2 days',
    source_url: data.source_url,
    is_link_valid: isValidUrl(data.source_url),
    is_placeholder: false,
    career_interests: getCourseCareerInterests(data.title, data.category_id),
    last_validation: new Date().toISOString()
  };
};

// Function to get static courses for fallback
export const getStaticCourses = (): Course[] => {
  return [
    {
      id: "1",
      title: "Fashion Design Fundamentals",
      summary: "Learn the basics of fashion design including sketching, pattern making, and garment construction.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1626497764746-6dc36546b388?w=800&auto=format&fit=crop",
      category_id: "beginner",
      is_featured: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      duration: "10-12 weeks",
      source_url: "https://www.youtube.com/playlist?list=PLjHFU8UBjlNu5XLSJ3oiJYQKurFnhTg9S",
      career_interests: ["designer", "model"]
    },
    {
      id: "2",
      title: "Advanced Fashion Photography",
      summary: "Master the art of fashion photography with professional lighting and composition techniques.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1493863641943-9b68992a8d07?w=800&auto=format&fit=crop",
      category_id: "advanced",
      is_featured: false,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      duration: "8 weeks",
      source_url: "https://www.youtube.com/playlist?list=PLjWd5gFyz2O6wbPTgtYFnMrjK3JjwCFvY",
      career_interests: ["photographer"]
    },
    {
      id: "3",
      title: "Runway Modeling Techniques",
      summary: "Learn professional runway walking, posing, and presentation techniques from industry experts.",
      content_type: "course",
      image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
      category_id: "intermediate",
      is_featured: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      duration: "6 weeks",
      source_url: "https://www.youtube.com/playlist?list=PLjeFjdH56A9rN_R1WopU4TDYRhq3JwMJy",
      career_interests: ["model"]
    }
  ];
};

// Function to schedule course refresh
export const scheduleCourseRefresh = async (): Promise<void> => {
  try {
    const { data, error } = await supabase.functions.invoke('education-automation', {
      body: { action: 'schedule-refresh' }
    });
    
    if (error) {
      console.error("Error scheduling course refresh:", error);
      return;
    }
    
    console.log("Course refresh scheduled:", data);
  } catch (err) {
    console.error("Unexpected error scheduling course refresh:", err);
  }
};

// Add the missing updateCourseProgress function
export const updateCourseProgress = async (
  userId: string,
  courseId: string, 
  status: "not_started" | "in_progress" | "completed",
  courseCategory?: string
): Promise<CourseProgress | null> => {
  try {
    // Check if a progress record already exists
    const { data: existingProgress, error: fetchError } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();
    
    const now = new Date().toISOString();
    
    if (fetchError && fetchError.code !== 'PGRST116') {  // PGRST116 is "no rows returned"
      console.error("Error fetching course progress:", fetchError);
      return null;
    }
    
    // If progress exists, update it
    if (existingProgress) {
      const updateData: Partial<CourseProgress> = {
        status,
        updated_at: now
      };
      
      // Only set completion date if status is completed and it wasn't completed before
      if (status === 'completed' && existingProgress.status !== 'completed') {
        updateData.date_completed = now;
      }
      
      const { data, error } = await supabase
        .from('user_course_progress')
        .update(updateData)
        .eq('id', existingProgress.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating course progress:", error);
        return null;
      }
      
      return data;
    } 
    // Otherwise create a new progress record
    else {
      const newProgress: Omit<CourseProgress, 'id'> = {
        user_id: userId,
        course_id: courseId,
        status,
        date_started: now,
        date_completed: status === 'completed' ? now : undefined,
        course_category: courseCategory,
        created_at: now,
        updated_at: now
      };
      
      const { data, error } = await supabase
        .from('user_course_progress')
        .insert([newProgress])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating course progress:", error);
        // For demonstration purposes, return a mock progress
        return {
          id: `mock-${Date.now()}`,
          user_id: userId,
          course_id: courseId,
          status,
          date_started: now,
          date_completed: status === 'completed' ? now : undefined,
          course_category: courseCategory,
          created_at: now,
          updated_at: now
        };
      }
      
      return data;
    }
  } catch (error) {
    console.error("Unexpected error in updateCourseProgress:", error);
    return null;
  }
};
