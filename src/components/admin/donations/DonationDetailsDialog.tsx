
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, FileCheck, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface DonationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: any;
  isLocked?: boolean;
}

const DonationDetailsDialog: React.FC<DonationDetailsDialogProps> = ({
  open,
  onOpenChange,
  donation,
  isLocked = false,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [rejectionReason, setRejectionReason] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  if (!donation) return null;

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleApprovePayment = async () => {
    // Placeholder for approval logic
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Payment Approved",
        description: "The donation payment has been approved.",
      });
      onOpenChange(false);
    }, 1000);
  };

  const handleRejectPayment = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Placeholder for rejection logic
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Payment Rejected",
        description: "The donation payment has been rejected.",
      });
      onOpenChange(false);
    }, 1000);
  };

  const handleIssueCertificate = async () => {
    if (!certificateUrl.trim()) {
      toast({
        title: "Certificate URL Required",
        description: "Please provide a URL for the certificate.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Placeholder for certificate issuance logic
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Certificate Issued",
        description: "The donation certificate has been issued successfully.",
      });
      onOpenChange(false);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Donation Details</DialogTitle>
          <DialogDescription>
            View and manage donation details for{" "}
            {donation.donors?.full_name || "Anonymous"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="donor">Donor Information</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>Donation Information</CardTitle>
                <CardDescription>
                  Details of the donation transaction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Amount</Label>
                    <p className="text-xl font-semibold">
                      {formatCurrency(donation.amount, donation.currency)}
                    </p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <div className="mt-1">
                      {donation.payment_status === "completed" ? (
                        <Badge className="bg-green-500">Completed</Badge>
                      ) : donation.payment_status === "pending" ? (
                        <Badge variant="outline" className="text-amber-500 border-amber-500">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Rejected</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <p>{formatDate(donation.created_at)}</p>
                  </div>
                  <div>
                    <Label>Payment Method</Label>
                    <p>{donation.payment_method || "N/A"}</p>
                  </div>
                </div>

                {donation.message && (
                  <div>
                    <Label>Message</Label>
                    <p className="border p-2 rounded-md bg-gray-50 mt-1">
                      {donation.message}
                    </p>
                  </div>
                )}

                {donation.payment_proof_url && (
                  <div>
                    <Label>Payment Proof</Label>
                    <div className="mt-2">
                      <img
                        src={donation.payment_proof_url}
                        alt="Payment proof"
                        className="max-h-40 object-contain border rounded-md"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open(donation.payment_proof_url, "_blank")}
                      >
                        <Download className="h-4 w-4 mr-1" /> Open Full Image
                      </Button>
                    </div>
                  </div>
                )}

                {donation.certificate_issued && (
                  <div>
                    <Label>Certificate</Label>
                    <div className="mt-1">
                      {donation.certificate_url ? (
                        <Button
                          variant="outline"
                          onClick={() => window.open(donation.certificate_url, "_blank")}
                        >
                          <FileCheck className="h-4 w-4 mr-1" /> View Certificate
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-green-500 border-green-500">
                          Issued (No URL)
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="donor">
            <Card>
              <CardHeader>
                <CardTitle>Donor Information</CardTitle>
                <CardDescription>Details about the donor</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {donation.donors ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <p>{donation.donors.full_name}</p>
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p>{donation.donors.email}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Phone</Label>
                        <p>{donation.donors.phone || "Not provided"}</p>
                      </div>
                      <div>
                        <Label>Total Donations</Label>
                        <p>
                          {donation.donors.total_donations
                            ? formatCurrency(
                                donation.donors.total_donations,
                                donation.currency
                              )
                            : "No previous donations"}
                        </p>
                      </div>
                    </div>

                    {donation.donors.address && (
                      <div>
                        <Label>Address</Label>
                        <p>{donation.donors.address}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No donor information available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle>Manage Donation</CardTitle>
                <CardDescription>
                  Actions available for this donation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {donation.payment_status === "pending" && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-md border">
                      <h4 className="text-sm font-medium mb-2">Payment Verification</h4>
                      <p className="text-gray-500 text-sm mb-4">
                        Verify the payment proof and approve or reject the donation
                      </p>

                      {!isLocked ? (
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleApprovePayment}
                            className="bg-green-500 hover:bg-green-600"
                            disabled={isSubmitting}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve Payment
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => setActiveTab("reject")}
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            disabled={isSubmitting}
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <p className="text-amber-500 text-sm">
                          Page is locked. Unlock to perform actions.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {donation.payment_status === "completed" && !donation.certificate_issued && (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-md border">
                      <h4 className="text-sm font-medium mb-2">Issue Certificate</h4>
                      <p className="text-gray-500 text-sm mb-4">
                        Generate and issue a donation certificate
                      </p>

                      {!isLocked ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Certificate URL</Label>
                            <Input
                              placeholder="Enter certificate URL"
                              value={certificateUrl}
                              onChange={(e) => setCertificateUrl(e.target.value)}
                            />
                          </div>

                          <Button
                            onClick={handleIssueCertificate}
                            className="bg-blue-500 hover:bg-blue-600"
                            disabled={isSubmitting}
                          >
                            <FileCheck className="h-4 w-4 mr-1" /> Issue Certificate
                          </Button>
                        </div>
                      ) : (
                        <p className="text-amber-500 text-sm">
                          Page is locked. Unlock to perform actions.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {donation.payment_status === "completed" && donation.certificate_issued && (
                  <p className="text-green-500">
                    This donation has been processed and a certificate has been issued.
                    No further actions required.
                  </p>
                )}

                {donation.payment_status === "rejected" && (
                  <p className="text-gray-500">
                    This donation has been rejected. No further actions required.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reject">
            <Card>
              <CardHeader>
                <CardTitle>Reject Donation</CardTitle>
                <CardDescription>
                  Provide a reason for rejecting this donation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Reason for Rejection</Label>
                    <Textarea
                      placeholder="Enter rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("actions")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectPayment}
                  disabled={isSubmitting || !rejectionReason.trim()}
                >
                  Confirm Rejection
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DonationDetailsDialog;
