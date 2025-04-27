
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CertificateApprovalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  certificateRequirements: {
    min_courses_required: number;
    min_workshops_required: number;
  };
  onApprove: () => void;
  loading: boolean;
  hasMetRequirements: (user: any) => boolean;
}

export const CertificateApprovalDialog: React.FC<CertificateApprovalDialogProps> = ({
  isOpen,
  onClose,
  user,
  certificateRequirements,
  onApprove,
  loading,
  hasMetRequirements,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve Certificate</DialogTitle>
          <DialogDescription>
            Are you sure you want to approve a certificate for{" "}
            {user?.profiles?.full_name || user?.profiles?.email || "this user"}?
            This will allow the user to download their certificate immediately.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="my-4 p-4 bg-gray-50 rounded border">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="font-medium">Online Courses:</p>
                <p>{user.online_courses_completed || 0} completed</p>
                <p className="text-xs text-gray-500">
                  Required: {certificateRequirements.min_courses_required}
                </p>
              </div>
              <div>
                <p className="font-medium">Workshops:</p>
                <p>{user.workshops_completed || 0} completed</p>
                <p className="text-xs text-gray-500">
                  Required: {certificateRequirements.min_workshops_required}
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onApprove}
            disabled={loading || (user && !hasMetRequirements(user))}
            className="bg-emerge-gold hover:bg-emerge-gold/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              "Approve Certificate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
