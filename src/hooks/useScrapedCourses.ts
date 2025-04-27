
import { useState, useEffect } from 'react';
import { ScrapedCourse } from '@/services/courseTypes';
import { 
  getPendingScrapedCourses, 
  approveScrapedCourse, 
  rejectScrapedCourse 
} from '@/services/scraping/courseScraperCore';
import { useToast } from './use-toast';

export const useScrapedCourses = () => {
  const [courses, setCourses] = useState<ScrapedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const { toast } = useToast();

  const fetchPendingCourses = async () => {
    setLoading(true);
    try {
      const pendingCourses = await getPendingScrapedCourses();
      setCourses(pendingCourses);
    } catch (error) {
      console.error("Error fetching pending courses:", error);
      toast({
        title: "Error",
        description: "Failed to load pending courses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (course: ScrapedCourse) => {
    setProcessingAction(true);
    try {
      const courseId = await approveScrapedCourse(course.id);
      if (courseId) {
        toast({
          title: "Success",
          description: "Course approved and published",
          variant: "default"
        });
        setCourses(courses.filter(c => c.id !== course.id));
      } else {
        throw new Error("Failed to approve course");
      }
    } catch (error) {
      console.error("Error approving course:", error);
      toast({
        title: "Error",
        description: "Failed to approve course",
        variant: "destructive"
      });
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async (courseId: string, reason: string) => {
    setProcessingAction(true);
    try {
      const success = await rejectScrapedCourse(courseId, reason);
      if (success) {
        toast({
          title: "Success",
          description: "Course rejected",
          variant: "default"
        });
        setCourses(courses.filter(c => c.id !== courseId));
        return true;
      } else {
        throw new Error("Failed to reject course");
      }
    } catch (error) {
      console.error("Error rejecting course:", error);
      toast({
        title: "Error",
        description: "Failed to reject course",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessingAction(false);
    }
  };

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  return {
    courses,
    loading,
    processingAction,
    fetchPendingCourses,
    handleApprove,
    handleReject
  };
};

