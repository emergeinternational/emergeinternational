
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

interface CertificateRevocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onRevoke: () => void;
  loading: boolean;
}

export const CertificateRevocationDialog: React.FC<CertificateRevocationDialogProps> = ({
  isOpen,
  onClose,
  user,
  onRevoke,
  loading,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Revoke Certificate</DialogTitle>
          <DialogDescription>
            Are you sure you want to revoke the certificate for{" "}
            {user?.profiles?.full_name || user?.profiles?.email || "this user"}?
            The user will no longer be able to download their certificate.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onRevoke} disabled={loading} variant="destructive">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Revoking...
              </>
            ) : (
              "Revoke Certificate"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
