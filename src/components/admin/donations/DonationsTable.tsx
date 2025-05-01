
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Download, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle, 
  FileCheck, 
  FileX 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

export interface DonationsTableProps {
  donations: any[];
  isLoading: boolean;
  onViewDetails: (donation: any) => void;
  onRefresh: () => void;
  isLocked?: boolean;
}

const DonationsTable: React.FC<DonationsTableProps> = ({ 
  donations, 
  isLoading, 
  onViewDetails, 
  onRefresh,
  isLocked = false 
}) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState<boolean>(false);
  const { toast } = useToast();

  const handlePreviewImage = (url: string) => {
    setImagePreviewUrl(url);
    setPreviewOpen(true);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!donations || donations.length === 0) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="h-10 w-10 mx-auto text-gray-400 mb-2" />
        <p className="text-gray-500">No donations found</p>
        <Button variant="outline" className="mt-4" onClick={onRefresh}>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Certificate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell>
                  <div className="font-medium">
                    {donation.donors?.full_name || "Anonymous"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {donation.donors?.email || "No email"}
                  </div>
                </TableCell>
                <TableCell>
                  {formatCurrency(donation.amount, donation.currency)}
                </TableCell>
                <TableCell>
                  {new Date(donation.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>{donation.payment_method || "N/A"}</TableCell>
                <TableCell>{getStatusBadge(donation.payment_status)}</TableCell>
                <TableCell>
                  {donation.payment_proof_url ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewImage(donation.payment_proof_url)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  ) : (
                    <span className="text-gray-500 text-sm">No proof</span>
                  )}
                </TableCell>
                <TableCell>
                  {donation.certificate_issued ? (
                    donation.certificate_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-500 hover:bg-green-50 text-green-500"
                        onClick={() => window.open(donation.certificate_url, "_blank")}
                      >
                        <FileCheck className="h-4 w-4 mr-1" /> View
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-green-500 border-green-500">
                        Issued
                      </Badge>
                    )
                  ) : (
                    <Badge variant="outline" className="text-gray-500">Not Issued</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails(donation)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Details
                    </Button>
                    
                    {!isLocked && donation.payment_status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500 hover:bg-green-50 text-green-500"
                          disabled={isLocked}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500 hover:bg-red-50 text-red-500"
                          disabled={isLocked}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </>
                    )}

                    {!isLocked && donation.payment_status === "completed" && !donation.certificate_issued && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-500 hover:bg-blue-50 text-blue-500"
                        disabled={isLocked}
                      >
                        <FileCheck className="h-4 w-4 mr-1" /> Issue Certificate
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {imagePreviewUrl && (
            <div className="flex flex-col items-center">
              <img
                src={imagePreviewUrl}
                alt="Payment proof"
                className="max-h-[70vh] object-contain"
              />
              <Button
                className="mt-4"
                onClick={() => window.open(imagePreviewUrl, "_blank")}
              >
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DonationsTable;
