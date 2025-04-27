
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PremiumCourse {
  id: string;
  title: string;
  description: string;
  price: number;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
  enrollments_count: number;
  category: "model" | "designer" | "photographer" | "videographer" | "musical_artist" | "fine_artist" | "event_planner";
  created_by?: string;
}

interface DeleteCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: PremiumCourse | null;
  onDelete: () => void;
}

const DeleteCourseDialog: React.FC<DeleteCourseDialogProps> = ({
  open,
  onOpenChange,
  course,
  onDelete
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete <strong>{course?.title}</strong>?</p>
          <p className="text-sm text-gray-500 mt-2">
            This action cannot be undone. All associated enrollments and content will be permanently removed.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            Delete Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCourseDialog;
