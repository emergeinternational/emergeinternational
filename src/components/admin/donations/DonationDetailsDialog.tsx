
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Download, ExternalLink, Mail, Phone, User } from "lucide-react";
import { DonationDetailsDialogProps } from "./DonationDetailsDialog.d";

const DonationDetailsDialog: React.FC<DonationDetailsDialogProps> = ({
  donation,
  open,
  onOpenChange,
  isLocked,
}: DonationDetailsDialogProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy h:mm a");
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>;
      case "refunded":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Donation Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          {/* Donation Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-3">Donation Information</h3>
            <Card className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Donation ID</p>
                  <p className="font-medium">{donation.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">{getStatusBadge(donation.payment_status)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium text-lg">
                    {formatCurrency(donation.amount, donation.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">{formatDate(donation.created_at)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-medium capitalize">{donation.payment_method || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Certificate</p>
                  <p className="font-medium">
                    {donation.certificate_issued ? "Issued" : "Not Issued"}
                  </p>
                </div>
              </div>
              
              {donation.message && (
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="italic text-gray-700 mt-1">"{donation.message}"</p>
                </div>
              )}
              
              {donation.payment_proof_url && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Payment Proof</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => window.open(donation.payment_proof_url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Payment Proof
                  </Button>
                </div>
              )}
            </Card>
          </div>
          
          {/* Donor Information */}
          {donation.profiles && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-3">Donor Information</h3>
              <Card className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{donation.profiles.full_name}</p>
                    <p className="text-sm text-gray-500">Donor</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-2 pl-10">
                  {donation.profiles.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <a
                        href={`mailto:${donation.profiles.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {donation.profiles.email}
                      </a>
                    </div>
                  )}
                  
                  {donation.profiles.phone_number && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{donation.profiles.phone_number}</span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
        
        <DialogFooter className="gap-2">
          {donation.certificate_url && (
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.open(donation.certificate_url, "_blank")}
            >
              <Download className="h-4 w-4" />
              Download Certificate
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DonationDetailsDialog;
