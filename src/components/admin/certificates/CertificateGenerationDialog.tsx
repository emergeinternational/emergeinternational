
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
import { Award, Loader2 } from "lucide-react";

interface CertificateGenerationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onGenerate: () => void;
  loading: boolean;
}

export const CertificateGenerationDialog: React.FC<CertificateGenerationDialogProps> = ({
  isOpen,
  onClose,
  user,
  onGenerate,
  loading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Certificate</DialogTitle>
          <DialogDescription>
            Generate a certificate for{" "}
            {user?.profiles?.full_name || user?.profiles?.email || "this user"}.
            This will create a downloadable certificate for the user.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="my-4 p-4 bg-gray-50 rounded border">
            <div className="space-y-4">
              <div>
                <p className="font-medium">User:</p>
                <p>
                  {user.profiles?.full_name || user.profiles?.email || "Unnamed User"}
                </p>
              </div>
              <div>
                <p className="font-medium">Course:</p>
                <p>Fashion Design & Model Development</p>
              </div>
              <div>
                <p className="font-medium">Certificate Format:</p>
                <p>PDF - Professional Design with Signature</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={onGenerate}
            disabled={loading || !user?.admin_approved}
            className="bg-emerge-gold hover:bg-emerge-gold/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Award className="h-4 w-4 mr-2" />
                Generate Certificate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
