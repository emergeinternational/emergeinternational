
import { useState, useEffect } from 'react';
import { ScrapedCourse } from '@/services/courseTypes';
import { 
  getPendingScrapedCourses, 
  approveScrapedCourse, 
  rejectScrapedCourse
} from '@/services/scraping/courseScraperCore';
import { useToast } from './use-toast';

interface ScraperStats {
  totalScraped: number;
  duplicatesDetected: number;
  duplicatesBySource: Record<string, number>;
}

export const useScrapedCourses = () => {
  const [courses, setCourses] = useState<ScrapedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingAction, setProcessingAction] = useState(false);
  const [scrapingInProgress, setScrapingInProgress] = useState(false);
  const [stats, setStats] = useState<ScraperStats>({
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
      const result = await approveScrapedCourse(course.id);
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
  
  const runManualScrape = async () => {
    setScrapingInProgress(true);
    try {
      // Implementation would connect to the backend scraper
      toast({
        title: "Scraper Started",
        description: "Course scraper is now running...",
        variant: "default"
      });
      
      // Wait for 3 seconds to simulate scraping
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Scraper Completed",
        description: "Course scraper completed successfully. Refreshing pending courses...",
        variant: "default"
      });
      
      await fetchPendingCourses();
      await fetchStats();
      return true;
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
      // This would be replaced with actual stats fetching
      // For now, we'll use placeholder data
      setStats({
        totalScraped: courses.length,
        duplicatesDetected: courses.filter(c => c.is_duplicate).length,
        duplicatesBySource: {
          youtube: 2,
          coursera: 1
        }
      });
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
