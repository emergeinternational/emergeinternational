
import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import TalentDetailsDialog from "./TalentDetailsDialog";

interface TalentApplication {
  id: string;
  full_name: string;
  email: string;
  country: string;
  category_type: string;
  status: string;
  created_at: string;
  [key: string]: any;
}

interface TalentApplicationsTableProps {
  applications: TalentApplication[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
  isLocked?: boolean;
}

const TalentApplicationsTable = ({ 
  applications, 
  isLoading, 
  isRefreshing,
  isLocked = false
}: TalentApplicationsTableProps) => {
  const [selectedTalent, setSelectedTalent] = useState<TalentApplication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (talent: TalentApplication) => {
    setSelectedTalent(talent);
    setIsDetailsOpen(true);
  };

  if (isLoading || isRefreshing) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-4">
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return <div className="text-center py-8 text-gray-500">No talent applications found</div>;
  }

  // Function to get badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Country</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <TableRow key={application.id}>
              <TableCell className="font-medium">{application.full_name}</TableCell>
              <TableCell>{application.email}</TableCell>
              <TableCell>{application.country}</TableCell>
              <TableCell>{application.category_type}</TableCell>
              <TableCell>{getStatusBadge(application.status)}</TableCell>
              <TableCell>{new Date(application.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(application)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                  {!isLocked && application.status === 'pending' && (
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
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedTalent && (
        <TalentDetailsDialog
          talent={selectedTalent}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          isLocked={isLocked}
        />
      )}
    </div>
  );
};

export default TalentApplicationsTable;
