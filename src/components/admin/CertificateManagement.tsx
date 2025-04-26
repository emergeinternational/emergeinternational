
import { useState, useEffect } from "react";
import { getEligibleUsers, updateCertificateApproval } from "../../services/courseService";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Award, 
  BookOpen, 
  AlertTriangle 
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const CertificateManagement = () => {
  const { toast } = useToast();
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRevocationDialog, setShowRevocationDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEligibleUsers();
  }, []);

  const fetchEligibleUsers = async () => {
    setLoading(true);
    try {
      const users = await getEligibleUsers();
      setEligibleUsers(users);
    } catch (error) {
      console.error("Error fetching eligible users:", error);
      toast({
        title: "Error",
        description: "Failed to load certificate eligible users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const success = await updateCertificateApproval(selectedUser.id, true);
      if (success) {
        toast({
          title: "Certificate Approved",
          description: `Certificate for ${selectedUser.profiles.full_name || selectedUser.profiles.email} has been approved.`,
        });
        await fetchEligibleUsers();
      } else {
        throw new Error("Failed to approve certificate");
      }
    } catch (error) {
      console.error("Error approving certificate:", error);
      toast({
        title: "Error",
        description: "Failed to approve certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setShowApprovalDialog(false);
    }
  };

  const handleRevoke = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      const success = await updateCertificateApproval(selectedUser.id, false);
      if (success) {
        toast({
          title: "Certificate Revoked",
          description: `Certificate for ${selectedUser.profiles.full_name || selectedUser.profiles.email} has been revoked.`,
        });
        await fetchEligibleUsers();
      } else {
        throw new Error("Failed to revoke certificate");
      }
    } catch (error) {
      console.error("Error revoking certificate:", error);
      toast({
        title: "Error",
        description: "Failed to revoke certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
      setShowRevocationDialog(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <Award className="h-5 w-5 mr-2 text-emerge-gold" />
          Certificate Management
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEligibleUsers}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading
            </>
          ) : (
            "Refresh"
          )}
        </Button>
      </div>

      {!loading && eligibleUsers.length === 0 ? (
        <div className="bg-emerge-cream p-8 text-center rounded-md">
          <BookOpen className="h-12 w-12 mx-auto mb-2 text-emerge-gold/60" />
          <h3 className="text-lg font-medium mb-1">No Eligible Users Found</h3>
          <p className="text-gray-600">
            Users need to complete at least 5 online courses and 3 workshops to be eligible.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Course Requirements</TableHead>
                <TableHead>Workshop Requirements</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading eligible users...</p>
                  </TableCell>
                </TableRow>
              ) : (
                eligibleUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.profiles.full_name || "Unnamed User"}</p>
                        <p className="text-sm text-gray-500">{user.profiles.email}</p>
                        <p className="text-xs text-gray-400">Eligible since: {formatDate(user.created_at)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>{user.online_courses_completed} online courses completed</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                        <span>{user.workshops_completed} workshops completed</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.admin_approved ? (
                        <Badge variant="success" className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center text-amber-600 border-amber-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Pending Approval
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.admin_approved ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 border-red-300 hover:bg-red-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRevocationDialog(true);
                          }}
                        >
                          Revoke Certificate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowApprovalDialog(true);
                          }}
                        >
                          Approve Certificate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Certificate</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve a certificate for {selectedUser?.profiles?.full_name || selectedUser?.profiles?.email}?
              This will allow the user to download their certificate immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApprovalDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={actionLoading}
              className="bg-emerge-gold hover:bg-emerge-gold/90"
            >
              {actionLoading ? (
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

      {/* Revocation Dialog */}
      <Dialog open={showRevocationDialog} onOpenChange={setShowRevocationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Certificate</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the certificate for {selectedUser?.profiles?.full_name || selectedUser?.profiles?.email}?
              The user will no longer be able to download their certificate.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRevocationDialog(false)}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRevoke}
              disabled={actionLoading}
              variant="destructive"
            >
              {actionLoading ? (
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
    </div>
  );
};

export default CertificateManagement;
