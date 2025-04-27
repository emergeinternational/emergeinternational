
import React from "react";
import { Loader2, Award } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CertificateActions } from "./CertificateActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CertificateTableProps {
  loading: boolean;
  eligibleUsers: any[];
  hasMetRequirements: (user: any) => boolean;
  formatDate: (date?: string) => string;
  certificateRequirements: {
    min_courses_required: number;
    min_workshops_required: number;
  };
  onViewDetails: (user: any) => void;
  onApprove: (user: any) => void;
  onGenerate: (user: any) => void;
  onRevoke: (user: any) => void;
  onManualIssue: (user: any) => void;
  actionLoading: boolean;
}

export const CertificateTable: React.FC<CertificateTableProps> = ({
  loading,
  eligibleUsers,
  hasMetRequirements,
  formatDate,
  certificateRequirements,
  onViewDetails,
  onApprove,
  onGenerate,
  onRevoke,
  onManualIssue,
  actionLoading,
}) => {
  if (loading) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead colSpan={6}>Loading...</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              <p className="mt-2 text-sm text-gray-500">Loading eligible users...</p>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  // Add a test button at the top of the table that will always be visible
  const TestGenerateButton = ({ user }: { user: any }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onGenerate(user)}
      className="bg-yellow-100 border-yellow-300 hover:bg-yellow-200 mb-4"
    >
      <Award className="h-4 w-4 mr-2 text-yellow-600" />
      Test Generate Certificate for {user?.profiles?.full_name || "User"}
    </Button>
  );

  return (
    <>
      {eligibleUsers.length > 0 && (
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium mb-2">Test Certificate Generation</h3>
          <p className="text-sm text-gray-500 mb-4">
            Use the button below to test certificate generation for the first user:
          </p>
          {eligibleUsers[0] && <TestGenerateButton user={eligibleUsers[0]} />}
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Online Courses</TableHead>
            <TableHead>Workshops</TableHead>
            <TableHead>Requirements</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eligibleUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{user.profiles?.full_name || "Unnamed User"}</p>
                  <p className="text-sm text-gray-500">{user.profiles?.email || "No email"}</p>
                  <p className="text-xs text-gray-400">
                    Eligible since: {formatDate(user.created_at)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      (user.online_courses_completed || 0) >=
                      certificateRequirements.min_courses_required
                        ? "bg-green-500"
                        : "bg-amber-500"
                    } mr-2`}
                  ></div>
                  <span>{user.online_courses_completed || 0} online courses</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      (user.workshops_completed || 0) >=
                      certificateRequirements.min_workshops_required
                        ? "bg-green-500"
                        : "bg-amber-500"
                    } mr-2`}
                  ></div>
                  <span>{user.workshops_completed || 0} workshops</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={hasMetRequirements(user) ? "success" : "outline"}
                  className={`flex items-center ${
                    !hasMetRequirements(user) && "text-amber-600 border-amber-600"
                  }`}
                >
                  {hasMetRequirements(user) ? "All Met" : "Not Met"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={user.admin_approved ? "success" : "outline"}
                  className={`flex items-center ${
                    !user.admin_approved && "text-amber-600 border-amber-600"
                  }`}
                >
                  {user.admin_approved ? "Approved" : "Pending Approval"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <CertificateActions
                    user={user}
                    hasMetRequirements={hasMetRequirements(user)}
                    onViewDetails={() => onViewDetails(user)}
                    onApprove={() => onApprove(user)}
                    onGenerate={() => onGenerate(user)}
                    onRevoke={() => onRevoke(user)}
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onManualIssue(user)}
                    disabled={actionLoading}
                    className="border-yellow-300 hover:bg-yellow-50"
                  >
                    <Award className="h-4 w-4 mr-2 text-yellow-600" />
                    Manual Issue
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};
