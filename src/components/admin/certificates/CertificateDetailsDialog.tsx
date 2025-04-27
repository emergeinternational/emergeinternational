
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
import { Award } from "lucide-react";
import { UserCourseDetails } from "./UserCourseDetails";
import { CertificateSettings } from "../../../services/certificate/types";

interface CertificateDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  certificateRequirements: CertificateSettings;
  onApprove: () => void;
  onGenerate: () => void;
  hasMetRequirements: (user: any) => boolean;
}

export const CertificateDetailsDialog: React.FC<CertificateDetailsDialogProps> = ({
  isOpen,
  onClose,
  user,
  certificateRequirements,
  onApprove,
  onGenerate,
  hasMetRequirements,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>User Course & Workshop Details</DialogTitle>
          <DialogDescription>
            Detailed information about course completion and workshop attendance for{" "}
            {user?.profiles?.full_name || user?.profiles?.email || "this user"}.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <UserCourseDetails
            user={user}
            certificateRequirements={certificateRequirements}
          />
        )}

        <DialogFooter>
          {/* Always show Generate Certificate button for testing */}
          <Button onClick={onGenerate} className="bg-emerge-gold hover:bg-emerge-gold/90">
            <Award className="h-4 w-4 mr-2" />
            Generate Certificate
          </Button>

          {user && !user.admin_approved && hasMetRequirements(user) && (
            <Button onClick={onApprove} className="bg-emerge-gold hover:bg-emerge-gold/90 ml-2">
              Approve Certificate
            </Button>
          )}

          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
