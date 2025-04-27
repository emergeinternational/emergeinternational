
import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useScrapedCourses } from '@/hooks/useScrapedCourses';
import CoursePreviewDialog from './CoursePreviewDialog';
import RejectionDialog from './RejectionDialog';
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

const ScrapedCoursesQueue = () => {
  const { courses, loading, processingAction, fetchPendingCourses, handleApprove, handleReject } = useScrapedCourses();
  const [selectedCourse, setSelectedCourse] = useState<ScrapedCourse | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);

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
        
        <CoursePreviewDialog
          isOpen={isPreviewDialogOpen}
          onOpenChange={setIsPreviewDialogOpen}
          course={selectedCourse}
          onApprove={handleApprove}
          onReject={() => {
            setIsPreviewDialogOpen(false);
            setIsRejectionDialogOpen(true);
          }}
          processingAction={processingAction}
          previewUrl={previewUrl}
        />
        
        <RejectionDialog
          isOpen={isRejectionDialogOpen}
          onOpenChange={setIsRejectionDialogOpen}
          courseName={selectedCourse?.title || ''}
          reason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={async () => {
            if (selectedCourse) {
              const success = await handleReject(selectedCourse.id, rejectionReason);
              if (success) {
                setIsRejectionDialogOpen(false);
                setRejectionReason('');
                setSelectedCourse(null);
              }
            }
          }}
          processingAction={processingAction}
        />
      </CardContent>
    </Card>
  );
};

export default ScrapedCoursesQueue;
