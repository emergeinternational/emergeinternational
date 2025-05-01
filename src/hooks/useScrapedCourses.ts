
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ScrapedCoursesHookOptions {
  fetchApproved?: boolean;
  fetchReviewed?: boolean;
  source?: string;
  limit?: number;
}

export const useScrapedCourses = (options?: ScrapedCoursesHookOptions) => {
  const {
    fetchApproved = false,
    fetchReviewed = false,
    source,
    limit = 100,
  } = options || {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<{ success: boolean; message: string; courseId?: string } | null>(null);

  // Query to get scraped courses
  const {
    data: scrapedCourses,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['scraped-courses', fetchApproved, fetchReviewed, source, limit],
    queryFn: async () => {
      let query = supabase.from('scraped_courses').select('*');

      if (fetchApproved) {
        query = query.eq('is_approved', true);
      }

      if (fetchReviewed) {
        query = query.eq('is_reviewed', true);
      }

      if (source) {
        query = query.eq('scraper_source', source);
      }

      query = query.order('created_at', { ascending: false }).limit(limit);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching scraped courses:', error);
        throw error;
      }

      return data;
    },
  });

  const approveCourse = async (courseId: string) => {
    try {
      setIsSubmitting(true);
      setReviewStatus(null);

      // First, update the course to be reviewed and approved
      const { error: updateError } = await supabase
        .from('scraped_courses')
        .update({
          is_reviewed: true,
          is_approved: true,
        })
        .eq('id', courseId);

      if (updateError) {
        throw updateError;
      }

      // Get the course data
      const { data: courseData, error: fetchError } = await supabase
        .from('scraped_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (fetchError || !courseData) {
        throw fetchError || new Error('Course not found');
      }

      // Transform data for regular courses table
      const { id, ...courseWithoutId } = courseData;

      // Insert into courses table
      const { data: insertedCourse, error: insertError } = await supabase
        .from('courses')
        .insert({
          ...courseWithoutId,
          is_published: true,
        })
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      await refetch();

      setReviewStatus({
        success: true,
        message: 'Course approved and published successfully!',
        courseId: insertedCourse.id,
      });

    } catch (error) {
      console.error('Error approving course:', error);
      setReviewStatus({
        success: false,
        message: `Failed to approve course: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectCourse = async (courseId: string, notes: string) => {
    try {
      setIsSubmitting(true);
      setReviewStatus(null);

      const { error } = await supabase
        .from('scraped_courses')
        .update({
          is_reviewed: true,
          is_approved: false,
          review_notes: notes,
        })
        .eq('id', courseId);

      if (error) {
        throw error;
      }

      await refetch();

      setReviewStatus({
        success: true,
        message: 'Course rejected.',
      });
    } catch (error) {
      console.error('Error rejecting course:', error);
      setReviewStatus({
        success: false,
        message: `Failed to reject course: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    scrapedCourses,
    isLoading,
    isError,
    isSubmitting,
    reviewStatus,
    approveCourse,
    rejectCourse,
    refetch,
  };
};

export default useScrapedCourses;
