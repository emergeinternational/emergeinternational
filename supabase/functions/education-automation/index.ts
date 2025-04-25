
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

// Sample course data to use as fallback
const FALLBACK_COURSES = [
  // Fashion Design - Beginner
  {
    title: "Fashion Design for Beginners: Sketching and Illustration",
    summary: "Learn the basics of fashion sketching and how to illustrate your designs from concept to final presentation. This course covers proportions, fabric rendering, and digital techniques.",
    category_id: "beginner",
    content_type: "course",
    source_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    image_url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "YouTube",
    duration: "2 hours"
  },
  {
    title: "Pattern Making Fundamentals",
    summary: "Understand the basics of pattern making for clothing. This course takes you through the process of creating patterns from measurements, making alterations, and preparing for production.",
    category_id: "beginner",
    content_type: "course",
    source_url: "https://www.coursera.org/learn/pattern-making",
    image_url: "https://images.unsplash.com/photo-1475695752828-6d2de6463206?w=800&auto=format&fit=crop",
    is_featured: false,
    source: "Coursera",
    duration: "4 weeks"
  },
  // Fashion Design - Intermediate
  {
    title: "Advanced Draping Techniques",
    summary: "Take your draping skills to the next level with this comprehensive course on creating complex garment structures directly on the dress form. Learn to translate three-dimensional ideas into finished patterns.",
    category_id: "intermediate",
    content_type: "course",
    source_url: "https://www.edx.org/learn/fashion/draping",
    image_url: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "edX",
    duration: "6 weeks"
  },
  // Fashion Design - Advanced
  {
    title: "Sustainable Fashion Collection Development",
    summary: "Learn how to develop a complete fashion collection with sustainability at its core. This course covers concept development, ethical material sourcing, zero-waste pattern cutting, and marketing strategies.",
    category_id: "advanced",
    content_type: "course",
    source_url: "https://www.youtube.com/watch?v=sustainable-fashion",
    image_url: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "YouTube",
    duration: "8 hours"
  },
  // Modeling - Beginner
  {
    title: "Introduction to Fashion Modeling",
    summary: "Learn the fundamentals of fashion modeling including posing, walking techniques, and portfolio development. This course is perfect for those just starting their modeling journey.",
    category_id: "beginner",
    content_type: "course",
    source_url: "https://www.youtube.com/watch?v=modeling-basics",
    image_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "YouTube",
    duration: "3 hours"
  },
  // Modeling - Intermediate
  {
    title: "Commercial and Editorial Posing",
    summary: "Master the art of posing for both commercial and editorial work. This course covers techniques for communicating different emotions and concepts through body language and facial expressions.",
    category_id: "intermediate",
    content_type: "course",
    source_url: "https://www.coursera.org/learn/fashion-posing",
    image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop",
    is_featured: false,
    source: "Coursera",
    duration: "3 weeks"
  },
  // Modeling - Advanced
  {
    title: "Runway Masterclass",
    summary: "Perfect your runway walk with this advanced course taught by industry professionals. Learn technical variations for different designers and how to handle complex runway scenarios.",
    category_id: "advanced",
    content_type: "course",
    source_url: "https://www.edx.org/learn/modeling/runway-techniques",
    image_url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "edX",
    duration: "2 weeks"
  },
  // Photography - Beginner
  {
    title: "Fashion Photography Essentials",
    summary: "Learn the basics of fashion photography including camera settings, lighting setups, directing models, and basic retouching. This comprehensive course is perfect for beginners.",
    category_id: "beginner",
    content_type: "course",
    source_url: "https://www.youtube.com/watch?v=photo-basics",
    image_url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "YouTube",
    duration: "5 hours"
  },
  // Photography - Intermediate
  {
    title: "Studio Lighting for Fashion",
    summary: "Master studio lighting techniques specifically for fashion photography. This course covers multiple lighting setups, modifiers, and how to achieve various moods and aesthetics.",
    category_id: "intermediate",
    content_type: "course",
    source_url: "https://www.coursera.org/learn/studio-lighting",
    image_url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&auto=format&fit=crop",
    is_featured: false,
    source: "Coursera",
    duration: "4 weeks"
  },
  // Photography - Advanced
  {
    title: "Editorial Fashion Photography",
    summary: "Take your fashion photography to publication level with this advanced course on editorial shooting. Learn about concept development, team collaboration, and creating cohesive visual narratives.",
    category_id: "advanced",
    content_type: "course",
    source_url: "https://www.edx.org/learn/photography/editorial-fashion",
    image_url: "https://images.unsplash.com/photo-1605289355680-75fb41239154?w=800&auto=format&fit=crop",
    is_featured: true,
    source: "edX",
    duration: "6 weeks"
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

    // For now, use fallback courses instead of actual scraping
    // In a real implementation, you would integrate with APIs or use web scraping here
    for (const course of FALLBACK_COURSES) {
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
        console.log(`Added new course: ${course.title}`);
      }
    }

    await logActivity('update_courses', 'success', `Updated ${updatedCoursesCount} courses`);
    
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

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Ensure log table exists
    await ensureLogTableExists();
    
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
