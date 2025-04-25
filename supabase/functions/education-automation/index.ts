import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Configure Supabase client
const supabaseUrl = 'https://dqfnetchkvnzrtacgvfw.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define categories and levels
const CATEGORIES = [
  { id: 'fashion-design', name: 'Fashion Design' },
  { id: 'modeling', name: 'Modeling' },
  { id: 'photography', name: 'Photography' }
];

const LEVELS = [
  { id: 'beginner', name: 'Beginner' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'advanced', name: 'Advanced' }
];

// Define talent types that map to our six creative industries
const TALENT_TYPES = [
  { id: 'designers', name: 'Designers' },
  { id: 'models', name: 'Models' },
  { id: 'photographers', name: 'Photographers' },
  { id: 'videographers', name: 'Videographers' },
  { id: 'influencers', name: 'Social Media Influencers' },
  { id: 'entertainment', name: 'Entertainment Talent' }
];

// Sources for course content
const SOURCES = [
  {
    name: 'YouTube',
    baseUrl: 'https://www.youtube.com',
    searchUrls: {
      'fashion-design': {
        'beginner': '/results?search_query=beginner+fashion+design+tutorial',
        'intermediate': '/results?search_query=intermediate+fashion+design+tutorial',
        'advanced': '/results?search_query=advanced+fashion+design+tutorial',
      },
      'modeling': {
        'beginner': '/results?search_query=beginner+modeling+tutorial',
        'intermediate': '/results?search_query=intermediate+modeling+tutorial', 
        'advanced': '/results?search_query=advanced+modeling+tutorial',
      },
      'photography': {
        'beginner': '/results?search_query=beginner+fashion+photography+tutorial',
        'intermediate': '/results?search_query=intermediate+fashion+photography+tutorial',
        'advanced': '/results?search_query=advanced+fashion+photography+tutorial',
      }
    }
  },
  {
    name: 'Coursera',
    baseUrl: 'https://www.coursera.org',
    searchUrls: {
      'fashion-design': '/search?query=fashion%20design&index=prod_all_products_term_optimization',
      'modeling': '/search?query=modeling&index=prod_all_products_term_optimization',
      'photography': '/search?query=fashion%20photography&index=prod_all_products_term_optimization',
    }
  },
  {
    name: 'edX',
    baseUrl: 'https://www.edx.org',
    searchUrls: {
      'fashion-design': '/search?q=fashion%20design',
      'modeling': '/search?q=modeling',
      'photography': '/search?q=photography',
    }
  }
];

// Enhanced sample course data with talent types for all six creative industries
const FALLBACK_COURSES = [
  // DESIGNERS
  {
    title: "Fashion Design for Beginners: Sketching and Illustration",
    summary: "Learn the basics of fashion sketching and how to illustrate your designs from concept to final presentation. This course covers proportions, fabric rendering, and digital techniques.",
    category_id: "beginner",
    content_type: "course",
    source_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    image_url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "YouTube",
    duration: "2 hours",
    talent_type: "designers"
  },
  {
    title: "Advanced Draping Techniques",
    summary: "Take your draping skills to the next level with this comprehensive course on creating complex garment structures directly on the dress form. Learn to translate three-dimensional ideas into finished patterns.",
    category_id: "intermediate",
    content_type: "course",
    source_url: "https://www.edx.org/learn/fashion/draping",
    image_url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "edX",
    duration: "6 weeks",
    talent_type: "designers"
  },
  // MODELS
  {
    title: "Introduction to Fashion Modeling",
    summary: "Learn the fundamentals of fashion modeling including posing, walking techniques, and portfolio development. This course is perfect for those just starting their modeling journey.",
    category_id: "beginner",
    content_type: "course",
    source_url: "https://www.youtube.com/watch?v=modeling-basics",
    image_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "YouTube",
    duration: "3 hours",
    talent_type: "models"
  },
  {
    title: "Runway Masterclass",
    summary: "Perfect your runway walk with this advanced course taught by industry professionals. Learn technical variations for different designers and how to handle complex runway scenarios.",
    category_id: "advanced",
    content_type: "course",
    source_url: "https://www.edx.org/learn/modeling/runway-techniques",
    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "edX",
    duration: "2 weeks",
    talent_type: "models"
  },
  // PHOTOGRAPHERS
  {
    title: "Fashion Photography Essentials",
    summary: "Learn the basics of fashion photography including camera settings, lighting setups, directing models, and basic retouching. This comprehensive course is perfect for beginners.",
    category_id: "beginner",
    content_type: "course",
    source_url: "https://www.youtube.com/watch?v=photo-basics",
    image_url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "YouTube",
    duration: "5 hours",
    talent_type: "photographers"
  },
  {
    title: "Editorial Fashion Photography",
    summary: "Take your fashion photography to publication level with this advanced course on editorial shooting. Learn about concept development, team collaboration, and creating cohesive visual narratives.",
    category_id: "advanced",
    content_type: "course",
    source_url: "https://www.edx.org/learn/photography/editorial-fashion",
    image_url: "https://images.unsplash.com/photo-1605289355680-75fb41239154?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "edX",
    duration: "6 weeks",
    talent_type: "photographers"
  },
  // VIDEOGRAPHERS
  {
    title: "Fashion Video Production Basics",
    summary: "Learn essential techniques for filming fashion content, from lookbooks to runway shows. Master camera movement, lighting, and basic editing for compelling fashion videos.",
    category_id: "beginner",
    content_type: "course",
    source_url: "https://www.youtube.com/watch?v=fashion-video-basics",
    image_url: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "YouTube",
    duration: "4 hours",
    talent_type: "videographers"
  },
  {
    title: "Advanced Fashion Film Direction",
    summary: "Master the art of conceptualizing and directing fashion films that tell compelling brand stories. Learn advanced techniques for working with models, stylists, and post-production teams.",
    category_id: "advanced",
    content_type: "course",
    source_url: "https://www.coursera.org/learn/fashion-film-direction",
    image_url: "https://images.unsplash.com/photo-1565130838609-c3a86655db61?w=800&auto=format&fit=crop",
    is_featured: false,
    source: "Coursera", 
    duration: "8 weeks",
    talent_type: "videographers"
  },
  // INFLUENCERS
  {
    title: "Building Your Fashion Brand on Social Media",
    summary: "Learn how to build an authentic fashion presence on Instagram, TikTok, and YouTube. Master content planning, photography basics, and audience growth strategies.",
    category_id: "beginner",
    content_type: "course",
    source_url: "https://www.youtube.com/watch?v=influence-basics",
    image_url: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "YouTube",
    duration: "3 hours",
    talent_type: "influencers"
  },
  {
    title: "Fashion Collaboration and Monetization Strategies",
    summary: "Learn advanced techniques for partnering with brands, negotiating deals, and creating multiple revenue streams as a fashion influencer.",
    category_id: "intermediate",
    content_type: "course",
    source_url: "https://www.coursera.org/learn/fashion-influencer-business",
    image_url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&auto=format&fit=crop",
    is_featured: false,
    source: "Coursera",
    duration: "5 weeks",
    talent_type: "influencers"
  },
  // ENTERTAINMENT TALENT
  {
    title: "Fashion Runway Performance",
    summary: "Master the art of runway performance for fashion shows. Learn walking techniques, posing, choreography basics, and how to embody different brand aesthetics.",
    category_id: "beginner",
    content_type: "course",
    source_url: "https://www.youtube.com/watch?v=runway-performance",
    image_url: "https://images.unsplash.com/photo-1517230878791-4d28214057c2?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "YouTube", 
    duration: "2 hours",
    talent_type: "entertainment"
  },
  {
    title: "Advanced Performance Art for Fashion Events",
    summary: "Take your fashion performance skills to the next level with techniques from performance art, contemporary dance, and theatrical presentation for high-concept fashion shows.",
    category_id: "advanced",
    content_type: "course",
    source_url: "https://www.edx.org/learn/fashion/performance-art",
    image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop",
    is_featured: false,
    source: "edX",
    duration: "7 weeks",
    talent_type: "entertainment"
  },
];

// Function to log activity for monitoring
async function logActivity(action: string, status: string, details: string) {
  try {
    const { error } = await supabase
      .from('education_automation_logs')
      .insert({
        action,
        status,
        details
      });
    
    if (error) throw error;
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

// Main function to update course content
async function updateCourseContent() {
  try {
    // Ensure categories exist
    for (const category of CATEGORIES) {
      const { data, error } = await supabase
        .from('education_categories')
        .select('id')
        .eq('id', category.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!data) {
        // Create category if it doesn't exist
        const { error: insertError } = await supabase
          .from('education_categories')
          .insert({
            id: category.id,
            name: category.name
          });
        
        if (insertError) throw insertError;
        
        console.log(`Created category: ${category.name}`);
        await logActivity('create_category', 'success', `Created category: ${category.name}`);
      }
    }

    let updatedCoursesCount = 0;
    let failedCategories = [];

    // For each talent type, ensure we have courses at every level
    for (const talentType of TALENT_TYPES) {
      // Filter fallback courses for this talent type
      const talentTypeCourses = FALLBACK_COURSES.filter(course => 
        course.talent_type === talentType.id
      );
      
      // Add these courses to the database if they don't exist
      for (const course of talentTypeCourses) {
        // Check if course already exists (by title)
        const { data: existingCourse, error: checkError } = await supabase
          .from('education_content')
          .select('id, title')
          .eq('title', course.title)
          .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (!existingCourse) {
          // Insert new course
          const { error: insertError } = await supabase
            .from('education_content')
            .insert({
              ...course,
              published_at: new Date().toISOString()
            });
          
          if (insertError) throw insertError;
          
          updatedCoursesCount++;
          console.log(`Added new course for ${talentType.name}: ${course.title}`);
        }
      }
    }

    await logActivity('update_courses', 'success', `Updated ${updatedCoursesCount} courses across all talent categories`);
    
    return {
      success: true,
      updated: updatedCoursesCount,
      failedCategories: failedCategories.length > 0 ? failedCategories : null
    };
  } catch (err) {
    console.error('Error updating course content:', err);
    await logActivity('update_courses', 'error', err.message);
    
    return {
      success: false,
      error: err.message
    };
  }
}

// Create the log table if it doesn't exist
async function ensureLogTableExists() {
  try {
    // Check if the table exists
    const { error } = await supabase.rpc('select_columns_info', { table_name: 'education_automation_logs' });
    
    if (error && error.message.includes('does not exist')) {
      // Define the SQL to create our log table
      const createTableSql = `
        CREATE TABLE IF NOT EXISTS public.education_automation_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          action TEXT NOT NULL,
          status TEXT NOT NULL,
          details TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Grant access to the service role
        GRANT ALL ON public.education_automation_logs TO service_role;

        -- Enable RLS
        ALTER TABLE public.education_automation_logs ENABLE ROW LEVEL SECURITY;

        -- Create policy to allow service_role full access
        CREATE POLICY "Service Role Full Access"
          ON public.education_automation_logs
          USING (true)
          WITH CHECK (true);
      `;
      
      // Execute the SQL directly (requires service_role key)
      await supabase.rpc('exec_sql', { sql_string: createTableSql });
      console.log('Created education_automation_logs table');
    }
  } catch (err) {
    console.error('Error ensuring log table exists:', err);
  }
}

// Ensure education content has the necessary columns
async function ensureEducationContentColumns() {
  try {
    // Check if talent_type column exists
    const { data: columnInfo, error } = await supabase
      .from('education_content')
      .select('talent_type')
      .limit(1);
    
    // If we get an error about the column not existing, add it
    if (error && error.message.includes('column "talent_type" does not exist')) {
      // Add the talent_type column
      await supabase.rpc('exec_sql', { 
        sql_string: `
          ALTER TABLE public.education_content 
          ADD COLUMN talent_type TEXT;
        `
      });
      console.log('Added talent_type column to education_content table');
      
      // Add the level column if it doesn't exist
      await supabase.rpc('exec_sql', { 
        sql_string: `
          ALTER TABLE public.education_content 
          ADD COLUMN level TEXT;
        `
      });
      console.log('Added level column to education_content table');
    }
  } catch (err) {
    console.error('Error checking or adding columns:', err);
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Ensure log table exists
    await ensureLogTableExists();
    
    // Ensure education_content has talent_type column
    await ensureEducationContentColumns();
    
    if (req.method === 'POST') {
      // For manual trigger or scheduled execution
      const result = await updateCourseContent();
      
      return new Response(JSON.stringify(result), {
        status: result.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else if (req.method === 'GET') {
      // For status check
      const { data, error } = await supabase
        .from('education_automation_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return new Response(JSON.stringify({
        status: 'operational',
        lastRuns: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in education automation function:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
