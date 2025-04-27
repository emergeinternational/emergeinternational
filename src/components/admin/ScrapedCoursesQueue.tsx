
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { getPendingScrapedCourses, approveScrapedCourse, rejectScrapedCourse } from '@/services/courseScraperService';
import { ScrapedCourse } from '@/services/courseTypes';
import { 
  Check, 
  X, 
  ExternalLink, 
  Eye, 
  Youtube, 
  Link2, 
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ScrapedCoursesQueue = () => {
  const [courses, setCourses] = useState<ScrapedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<ScrapedCourse | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);
  const { toast } = useToast();
  
  // Fetch pending courses
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
  
  // Load courses on component mount
  useEffect(() => {
    fetchPendingCourses();
  }, []);
  
  // Handle course approval
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
        // Remove from list
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
  
  // Handle course rejection
  const handleReject = async () => {
    if (!selectedCourse) return;
    
    setProcessingAction(true);
    try {
      const success = await rejectScrapedCourse(selectedCourse.id, rejectionReason);
      if (success) {
        toast({
          title: "Success",
          description: "Course rejected",
          variant: "default"
        });
        // Remove from list
        setCourses(courses.filter(c => c.id !== selectedCourse.id));
        setIsRejectionDialogOpen(false);
        setRejectionReason('');
        setSelectedCourse(null);
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
    } finally {
      setProcessingAction(false);
    }
  };
  
  // Preview content
  const handlePreview = (course: ScrapedCourse) => {
    setSelectedCourse(course);
    
    if (course.hosting_type === 'embedded' && course.video_embed_url) {
      // Convert YouTube/Vimeo URLs to embed URLs if they're not already
      let embedUrl = course.video_embed_url;
      
      // YouTube conversion
      if (embedUrl.includes('youtube.com/watch?v=')) {
        const videoId = new URL(embedUrl).searchParams.get('v');
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (embedUrl.includes('youtu.be/')) {
        const videoId = embedUrl.split('/').pop();
        embedUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      // Vimeo conversion
      else if (embedUrl.includes('vimeo.com/')) {
        const videoId = embedUrl.split('/').pop();
        embedUrl = `https://player.vimeo.com/video/${videoId}`;
      }
      
      setPreviewUrl(embedUrl);
    } else if (course.hosting_type === 'external' && course.external_link) {
      setPreviewUrl(course.external_link);
    }
    
    setIsPreviewDialogOpen(true);
  };
  
  // Get source icon
  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case 'youtube':
        return <Youtube className="text-red-500" size={16} />;
      case 'vimeo':
        return <Youtube className="text-blue-500" size={16} />;
      case 'coursera':
        return <ExternalLink className="text-blue-700" size={16} />;
      case 'alison':
        return <ExternalLink className="text-green-500" size={16} />;
      case 'openlearn':
        return <ExternalLink className="text-purple-500" size={16} />;
      default:
        return <Link2 className="text-gray-500" size={16} />;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Course Approval Queue</span>
          <Button
            variant="outline"
            onClick={fetchPendingCourses}
            disabled={loading}
          >
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>
          Review and approve scraped courses before they are published
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin text-emerge-gold text-2xl mb-2">⌛</div>
            <p>Loading courses...</p>
          </div>
        ) : courses.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No courses pending review at this time.
            </AlertDescription>
          </Alert>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {course.image_url && (
                        <img 
                          src={course.image_url} 
                          alt={course.title} 
                          className="w-10 h-10 object-cover rounded"
                        />
                      )}
                      <span className="font-medium">{course.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {course.category.charAt(0).toUpperCase() + course.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      course.level === 'beginner' ? 'bg-green-100' :
                      course.level === 'intermediate' ? 'bg-yellow-100' : 
                      'bg-red-100'
                    }>
                      {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {getSourceIcon(course.scraper_source)}
                      <span>{course.scraper_source}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.hosting_type === 'embedded' ? 'Embedded Video' : 'External Link'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(course)}
                      >
                        <Eye size={16} className="mr-1" />
                        Preview
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(course)}
                        disabled={processingAction}
                      >
                        <Check size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setIsRejectionDialogOpen(true);
                        }}
                        disabled={processingAction}
                      >
                        <X size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {/* Rejection Dialog */}
        <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Course</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting "{selectedCourse?.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason"
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsRejectionDialogOpen(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={processingAction || !rejectionReason.trim()}
              >
                {processingAction ? 'Processing...' : 'Reject Course'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Preview Dialog */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedCourse?.title}</DialogTitle>
              <DialogDescription>
                {selectedCourse?.summary}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedCourse?.hosting_type === 'embedded' && previewUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : selectedCourse?.hosting_type === 'external' ? (
                <div className="flex flex-col items-center justify-center p-4 border rounded-md">
                  <ExternalLink className="h-16 w-16 text-gray-400 mb-2" />
                  <p className="text-center text-sm text-gray-500 mb-3">
                    External course hosted at:
                  </p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerge-gold hover:underline break-all text-center"
                  >
                    {previewUrl}
                  </a>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No preview available
                </div>
              )}
            </div>
            <DialogFooter>
              <div className="flex w-full justify-between">
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsPreviewDialogOpen(false);
                    setIsRejectionDialogOpen(true);
                  }}
                >
                  <X size={16} className="mr-1" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setIsPreviewDialogOpen(false);
                    if (selectedCourse) handleApprove(selectedCourse);
                  }}
                  disabled={processingAction}
                >
                  <Check size={16} className="mr-1" />
                  Approve
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ScrapedCoursesQueue;
