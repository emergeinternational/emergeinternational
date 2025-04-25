
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks user engagement with a course by recording clicks
 */
export const trackCourseEngagement = async (courseId: string): Promise<void> => {
  try {
    const { data: existingEngagement } = await supabase
      .from('course_engagement')
      .select('*')
      .eq('course_id', courseId)
      .single();

    if (existingEngagement) {
      await supabase
        .from('course_engagement')
        .update({
          total_clicks: existingEngagement.total_clicks + 1,
          last_click_date: new Date().toISOString(),
        })
        .eq('course_id', courseId);
    } else {
      await supabase
        .from('course_engagement')
        .insert({
          course_id: courseId,
          total_clicks: 1,
          last_click_date: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error('Error tracking course engagement:', error);
  }
};

/**
 * Tracks user progress through a course
 */
export const trackCourseProgress = async (courseId: string, category: string): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      console.log('User not authenticated, skipping progress tracking');
      return;
    }
    
    const userId = sessionData.session.user.id;

    const { data: existingProgress } = await supabase
      .from('user_course_progress')
      .select('*')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single();

    if (!existingProgress) {
      await supabase
        .from('user_course_progress')
        .insert({
          user_id: userId,
          course_id: courseId,
          course_category: category,
          status: 'started',
        });
    }
  } catch (error) {
    console.error('Error tracking course progress:', error);
  }
};

/**
 * Marks a course as completed for the current user
 */
export const markCourseCompleted = async (courseId: string): Promise<void> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session?.user) {
      console.log('User not authenticated, cannot mark course complete');
      return;
    }
    
    const userId = sessionData.session.user.id;

    await supabase
      .from('user_course_progress')
      .update({
        status: 'completed',
        date_completed: new Date().toISOString(),
      })
      .eq('course_id', courseId)
      .eq('user_id', userId);
  } catch (error) {
    console.error('Error marking course as completed:', error);
  }
};
