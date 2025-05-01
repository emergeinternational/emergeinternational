
import { useState, useEffect } from 'react';
import { ScrapedCourse } from '@/services/courseTypes';
import { 
  getPendingScrapedCourses, 
  approveScrapedCourse, 
  rejectScrapedCourse,
  triggerManualScrape,
  getDuplicateStats
} from '@/services/scraping/courseScraperCore';
import { useToast } from './use-toast';

export const useScrapedCourses = () => {
  const [courses, setCourses] = useState<ScrapedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [scrapingInProgress, setScrapingInProgress] = useState(false);
  const [stats, setStats] = useState<{
    totalScraped: number;
    duplicatesDetected: number;
    duplicatesBySource: Record<string, number>;
  }>({
    totalScraped: 0,
    duplicatesDetected: 0,
    duplicatesBySource: {}
  });
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
      const result = await approveScrapedCourse(course.id || '');
      if (result.success) {
        toast({
          title: "Success",
          description: course.is_duplicate && course.duplicate_confidence && course.duplicate_confidence >= 90 
            ? "Duplicate course handled successfully" 
            : "Course approved and published",
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
      const result = await rejectScrapedCourse(courseId, reason);
      if (result.success) {
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
  
  const runManualScrape = async () => {
    setScrapingInProgress(true);
    try {
      const result = await triggerManualScrape();
      if (result.success) {
        toast({
          title: "Scraper Completed",
          description: "Course scraper completed successfully. Refreshing pending courses...",
          variant: "default"
        });
        await fetchPendingCourses();
        await fetchStats();
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error running manual scrape:", error);
      toast({
        title: "Error",
        description: "Failed to run course scraper",
        variant: "destructive"
      });
      return false;
    } finally {
      setScrapingInProgress(false);
    }
  };
  
  const fetchStats = async () => {
    try {
      const duplicateStats = await getDuplicateStats();
      if (duplicateStats.success) {
        setStats(prev => ({
          ...prev,
          duplicatesDetected: duplicateStats.duplicateCount || 0
        }));
      }
    } catch (error) {
      console.error("Error fetching scraper stats:", error);
    }
  };

  useEffect(() => {
    fetchPendingCourses();
    fetchStats();
  }, []);

  return {
    courses,
    loading,
    processingAction,
    scrapingInProgress,
    stats,
    fetchPendingCourses,
    handleApprove,
    handleReject,
    runManualScrape,
    fetchStats
  };
};
