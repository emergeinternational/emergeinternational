import React, { useState, useEffect } from "react";
import { Award, Loader2 } from "lucide-react";
import {
  getEligibleUsers,
  updateCertificateApproval,
  generateCertificate,
  getCertificateSettings,
  getUsersByStatus,
} from "@/services/certificate";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { CertificateRequirementsBanner } from "./CertificateRequirementsBanner";
import { EmptyEligibleUsers } from "./EmptyEligibleUsers";
import CertificateStatusFilter from "../CertificateStatusFilter";
import CertificateSettings from "../CertificateSettings";
import { CertificateTable } from "./CertificateTable";
import { CertificateDetailsDialog } from "./CertificateDetailsDialog";
import { CertificateApprovalDialog } from "./CertificateApprovalDialog";
import { CertificateGenerationDialog } from "./CertificateGenerationDialog";
import { CertificateRevocationDialog } from "./CertificateRevocationDialog";

const CertificateManagement = () => {
  const { toast } = useToast();
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRevocationDialog, setShowRevocationDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [certificateRequirements, setCertificateRequirements] = useState({
    min_courses_required: 5,
    min_workshops_required: 3
  });
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    denied: 0
  });

  const handleManualCertificateIssue = async (user: any) => {
    setActionLoading(true);
    try {
      const courseTitle = "Fashion Design & Model Development";
      const result = await generateCertificate(user.user_id, courseTitle);
      
      if (result.success) {
        toast({
          title: "Certificate Issued",
          description: `Certificate has been manually issued for ${user.profiles?.full_name || user.profiles?.email || "User"}.`,
        });
        await fetchEligibleUsers();
        await fetchStatusCounts();
      } else {
        throw new Error(result.error || "Failed to issue certificate");
      }
    } catch (error) {
      console.error("Error issuing certificate:", error);
      toast({
        title: "Error",
        description: "Failed to issue certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchEligibleUsers();
    fetchCertificateSettings();
    fetchStatusCounts();
  }, [selectedStatus]);

  const fetchCertificateSettings = async () => {
    try {
      const settings = await getCertificateSettings();
      setCertificateRequirements(settings);
    } catch (error) {
      console.error("Error fetching certificate settings:", error);
    }
  };

  const fetchStatusCounts = async () => {
    try {
      const pending = await getUsersByStatus('pending');
      const approved = await getUsersByStatus('approved');
      const denied = await getUsersByStatus('denied');
      
      setStatusCounts({
        pending: pending.length,
        approved: approved.length,
        denied: denied.length
      });
    } catch (error) {
      console.error("Error fetching status counts:", error);
    }
  };

  const fetchEligibleUsers = async () => {
    setLoading(true);
    try {
      let users;
      if (selectedStatus === 'all') {
        users = await getEligibleUsers();
      } else {
        users = await getUsersByStatus(selectedStatus);
      }
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
      const success = await updateCertificateApproval(selectedUser.user_id, true);
      if (success) {
        toast({
          title: "Certificate Approved",
          description: `Certificate for ${selectedUser.profiles?.full_name || selectedUser.profiles?.email || "User"} has been approved.`,
        });
        await fetchEligibleUsers();
        await fetchStatusCounts();
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
      const success = await updateCertificateApproval(selectedUser.user_id, false);
      if (success) {
        toast({
          title: "Certificate Revoked",
          description: `Certificate for ${selectedUser.profiles?.full_name || selectedUser.profiles?.email || "User"} has been revoked.`,
        });
        await fetchEligibleUsers();
        await fetchStatusCounts();
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

  const handleGenerateCertificate = async () => {
    if (!selectedUser) return;
    
    setGeneratingCertificate(true);
    try {
      const courseTitle = "Fashion Design & Model Development";
      
      const result = await generateCertificate(
        selectedUser.user_id,
        courseTitle
      );
      
      if (result.success) {
        toast({
          title: "Certificate Generated",
          description: `Certificate has been successfully generated for ${selectedUser.profiles?.full_name || selectedUser.profiles?.email || "User"}.`,
        });
        await fetchEligibleUsers();
      } else {
        throw new Error(result.error || "Failed to generate certificate");
      }
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast({
        title: "Error",
        description: "Failed to generate certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingCertificate(false);
      setShowGenerateDialog(false);
    }
  };

  const handleSettingsChanged = () => {
    fetchCertificateSettings();
    fetchEligibleUsers();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const hasMetRequirements = (user: any) => {
    if (!user) return false;
    const onlineCoursesCompleted = user.online_courses_completed || 0;
    const workshopsCompleted = user.workshops_completed || 0;
    return (
      onlineCoursesCompleted >= certificateRequirements.min_courses_required &&
      workshopsCompleted >= certificateRequirements.min_workshops_required
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <Award className="h-5 w-5 mr-2 text-emerge-gold" />
          Certificate Management
        </h2>
        <div className="flex space-x-2">
          <CertificateSettings onSettingsChanged={handleSettingsChanged} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchEligibleUsers();
              fetchStatusCounts();
            }}
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
      </div>

      <CertificateRequirementsBanner
        minCoursesRequired={certificateRequirements.min_courses_required}
        minWorkshopsRequired={certificateRequirements.min_workshops_required}
      />

      <CertificateStatusFilter
        currentStatus={selectedStatus}
        onChange={setSelectedStatus}
        counts={statusCounts}
      />

      {!loading && eligibleUsers.length === 0 ? (
        <EmptyEligibleUsers
          minCoursesRequired={certificateRequirements.min_courses_required}
          minWorkshopsRequired={certificateRequirements.min_workshops_required}
        />
      ) : (
        <div className="bg-white rounded-md border overflow-hidden">
          <CertificateTable
            loading={loading}
            eligibleUsers={eligibleUsers}
            hasMetRequirements={hasMetRequirements}
            formatDate={formatDate}
            certificateRequirements={certificateRequirements}
            onViewDetails={(user) => {
              setSelectedUser(user);
              setShowDetailsDialog(true);
            }}
            onApprove={(user) => {
              setSelectedUser(user);
              setShowApprovalDialog(true);
            }}
            onGenerate={(user) => {
              setSelectedUser(user);
              setShowGenerateDialog(true);
            }}
            onRevoke={(user) => {
              setSelectedUser(user);
              setShowRevocationDialog(true);
            }}
            onManualIssue={handleManualCertificateIssue}
            actionLoading={actionLoading}
          />
        </div>
      )}

      <CertificateDetailsDialog
        isOpen={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        user={selectedUser}
        certificateRequirements={certificateRequirements}
        onApprove={() => {
          setShowDetailsDialog(false);
          setShowApprovalDialog(true);
        }}
        onGenerate={() => {
          setShowDetailsDialog(false);
          setShowGenerateDialog(true);
        }}
        hasMetRequirements={hasMetRequirements}
      />

      <CertificateApprovalDialog
        isOpen={showApprovalDialog}
        onClose={() => setShowApprovalDialog(false)}
        user={selectedUser}
        certificateRequirements={certificateRequirements}
        onApprove={handleApprove}
        loading={actionLoading}
        hasMetRequirements={hasMetRequirements}
      />

      <CertificateGenerationDialog
        isOpen={showGenerateDialog}
        onClose={() => setShowGenerateDialog(false)}
        user={selectedUser}
        onGenerate={handleGenerateCertificate}
        loading={generatingCertificate}
      />

      <CertificateRevocationDialog
        isOpen={showRevocationDialog}
        onClose={() => setShowRevocationDialog(false)}
        user={selectedUser}
        onRevoke={handleRevoke}
        loading={actionLoading}
      />

      {!loading && eligibleUsers.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          Showing {eligibleUsers.length} of {eligibleUsers.length} users
          {eligibleUsers.filter((u) => u.is_new).length > 0 && (
            <span className="ml-1">
              including{" "}
              <span className="font-semibold text-emerald-600">
                {eligibleUsers.filter((u) => u.is_new).length} new
              </span>{" "}
              in the last hour
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default CertificateManagement;
