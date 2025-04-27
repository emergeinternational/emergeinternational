
import React from 'react';
import { ScrapedCourse } from '@/services/courseTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, ExternalLink } from 'lucide-react';

interface CoursePreviewDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  course: ScrapedCourse | null;
  onApprove: (course: ScrapedCourse) => void;
  onReject: () => void;
  processingAction: boolean;
  previewUrl: string;
}

const CoursePreviewDialog = ({
  isOpen,
  onOpenChange,
  course,
  onApprove,
  onReject,
  processingAction,
  previewUrl
}: CoursePreviewDialogProps) => {
  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{course.title}</DialogTitle>
          <DialogDescription>{course.summary}</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {course.hosting_type === 'embedded' && previewUrl ? (
            <div className="aspect-video">
              <iframe
                src={previewUrl}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          ) : course.hosting_type === 'external' ? (
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
              onClick={onReject}
            >
              <X size={16} className="mr-1" />
              Reject
            </Button>
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => course && onApprove(course)}
              disabled={processingAction}
            >
              <Check size={16} className="mr-1" />
              Approve
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CoursePreviewDialog;

