
import { useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  MoreHorizontal, 
  Eye, 
  Download, 
  FileCheck,
  RefreshCcw,
} from "lucide-react";
import DonationDetailsDialog from "./DonationDetailsDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DonationsTable = ({
  donations,
  isLoading,
  onRefresh,
  onViewDetails,
  isLocked,
}) => {
  const { toast } = useToast();
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [donationToRefund, setDonationToRefund] = useState(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setDetailsOpen(true);
    onViewDetails(donation);
  };

  const handleRefund = (donation) => {
    setDonationToRefund(donation);
    setRefundDialogOpen(true);
  };

  const confirmRefund = async () => {
    if (!donationToRefund) return;

    try {
      setIsRefunding(true);
      
      // Update donation status
      const { error } = await supabase
        .from('donations')
        .update({ payment_status: 'refunded' })
        .eq('id', donationToRefund.id);

      if (error) throw error;
      
      toast({
        title: "Donation refunded",
        description: `The donation of ${donationToRefund.currency} ${donationToRefund.amount} has been marked as refunded.`,
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "Error processing refund",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsRefunding(false);
      setRefundDialogOpen(false);
      setDonationToRefund(null);
    }
  };

  const generateCertificate = async (donation) => {
    try {
      setIsGeneratingCertificate(true);
      
      // Here you'd generate a certificate and update the database
      // For now, we'll simulate this with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const certificateUrl = `https://example.com/certificates/donation-${donation.id}.pdf`;
      
      // Update donation with certificate info
      const { error } = await supabase
        .from('donations')
        .update({
          certificate_issued: true,
          certificate_url: certificateUrl
        })
        .eq('id', donation.id);
      
      if (error) throw error;
      
      toast({
        title: "Certificate generated",
        description: "The donation certificate has been generated successfully.",
      });
      
      onRefresh();
    } catch (error) {
      toast({
        title: "Error generating certificate",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
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

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Loading donations...</p>
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <p className="text-gray-500">No donations found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Certificate</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell className="font-medium">
                  {donation.id.slice(0, 8)}
                </TableCell>
                <TableCell>
                  {donation.profiles?.full_name || "Anonymous"}
                </TableCell>
                <TableCell>
                  {formatCurrency(donation.amount, donation.currency)}
                </TableCell>
                <TableCell>{formatDate(donation.created_at)}</TableCell>
                <TableCell>{getStatusBadge(donation.payment_status)}</TableCell>
                <TableCell>
                  {donation.certificate_issued ? (
                    <Badge variant="outline" className="bg-blue-50">Issued</Badge>
                  ) : (
                    <Badge variant="outline">Not Issued</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(donation)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      
                      {donation.payment_status === "completed" && !donation.certificate_issued && (
                        <DropdownMenuItem 
                          onClick={() => generateCertificate(donation)}
                          disabled={isGeneratingCertificate || isLocked}
                        >
                          <FileCheck className="mr-2 h-4 w-4" />
                          Generate Certificate
                        </DropdownMenuItem>
                      )}
                      
                      {donation.certificate_url && (
                        <DropdownMenuItem 
                          onClick={() => window.open(donation.certificate_url, "_blank")}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download Certificate
                        </DropdownMenuItem>
                      )}
                      
                      {donation.payment_status === "completed" && !isLocked && (
                        <DropdownMenuItem 
                          onClick={() => handleRefund(donation)}
                          className="text-red-600"
                        >
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Process Refund
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Donation Details Dialog */}
      {selectedDonation && (
        <DonationDetailsDialog
          donation={selectedDonation}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
          isLocked={isLocked}
        />
      )}

      {/* Refund Confirmation Dialog */}
      <AlertDialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Refund</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to process a refund for this donation? 
              This will mark the donation as refunded in the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRefunding}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRefund}
              disabled={isRefunding}
              className="bg-red-600 hover:bg-red-700"
            >
              {isRefunding ? "Processing..." : "Process Refund"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DonationsTable;
