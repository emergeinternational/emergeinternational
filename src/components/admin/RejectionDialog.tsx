
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface RejectionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
  processingAction: boolean;
}

const RejectionDialog = ({
  isOpen,
  onOpenChange,
  courseName,
  reason,
  onReasonChange,
  onConfirm,
  processingAction
}: RejectionDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Course</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejecting "{courseName}"
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Enter rejection reason"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={processingAction || !reason.trim()}
          >
            {processingAction ? 'Processing...' : 'Reject Course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectionDialog;

