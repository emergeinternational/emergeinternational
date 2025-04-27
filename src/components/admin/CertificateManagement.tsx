
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Check, Clock, X } from "lucide-react";
import { extendedButtonVariants } from "@/components/ui/button";
import { approveCertificate, rejectCertificate, getCertificateSettings } from "@/services/certificate/index";
import CertificateStatusFilter from "./CertificateStatusFilter";
import { EmptyEligibleUsers } from "./certificates/EmptyEligibleUsers";
import { UserCourseDetails } from "./certificates/UserCourseDetails";
import { CertificateRequirementsBanner } from "./certificates/CertificateRequirementsBanner";
import { CertificateActions } from "./certificates/CertificateActions";
import RejectionDialog from "./RejectionDialog";

export function CertificateManagement() {
  const { toast } = useToast();
  const { hasRole } = useAuth();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [isLoading, setIsLoading] = useState(false);
  const [certificateSettings, setCertificateSettings] = useState({
    min_courses_required: 5,
    min_workshops_required: 3
  });

  // Fetch certificate settings on component mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getCertificateSettings();
        setCertificateSettings(settings);
      } catch (error) {
        console.error("Error fetching certificate settings:", error);
      }
    };
    
    fetchSettings();
  }, []);

  const dummyUsers = [
    {
      id: "1",
      name: "Aster Aweke",
      email: "aster@example.com",
      online_courses_completed: 6,
      workshops_completed: 4,
      courses: [
        {
          id: "course1",
          title: "Introduction to Fashion Design",
          progress: 100,
          certification: { status: "pending", requested_at: "2023-05-15" },
        },
      ],
    },
    {
      id: "2",
      name: "Teddy Afro",
      email: "teddy@example.com",
      online_courses_completed: 8,
      workshops_completed: 5,
      courses: [
        {
          id: "course2",
          title: "Advanced Pattern Making",
          progress: 90,
          certification: { 
            status: "approved", 
            requested_at: "2023-05-10", 
            approved_at: "2023-05-12" 
          },
        },
      ],
    },
    {
      id: "3",
      name: "Gigi Hadid",
      email: "gigi@example.com",
      online_courses_completed: 4,
      workshops_completed: 2,
      courses: [
        {
          id: "course3",
          title: "Fashion Photography Basics",
          progress: 100,
          certification: { 
            status: "rejected", 
            requested_at: "2023-05-08", 
            rejected_at: "2023-05-11", 
            reason: "Incomplete final project submission" 
          },
        },
      ],
    },
  ];

  // Filter users based on certification status
  const filteredUsers = dummyUsers.filter((user) => {
    return user.courses.some((course) => course.certification?.status === statusFilter);
  });

  const handleApprove = async (userId: string, courseId: string) => {
    setIsLoading(true);
    try {
      await approveCertificate(userId, courseId);
      toast({
        title: "Certificate Approved",
        description: "User has been notified and certificate has been generated.",
      });
      // In a real app, we'd refetch the data here
    } catch (error) {
      console.error("Error approving certificate:", error);
      toast({
        title: "Error",
        description: "Failed to approve certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (userId: string, courseId: string, reason: string) => {
    setIsLoading(true);
    try {
      await rejectCertificate(userId, courseId, reason);
      setShowRejectionDialog(false);
      toast({
        title: "Certificate Rejected",
        description: "User has been notified about the rejection.",
      });
      // In a real app, we'd refetch the data here
    } catch (error) {
      console.error("Error rejecting certificate:", error);
      toast({
        title: "Error",
        description: "Failed to reject certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasRole(["admin", "editor"])) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Certificate Management</h2>
      
      <CertificateStatusFilter
        activeFilter={statusFilter}
        onChange={setStatusFilter}
        counts={{
          pending: filteredUsers.filter(u => u.courses.some(c => c.certification?.status === 'pending')).length,
          approved: filteredUsers.filter(u => u.courses.some(c => c.certification?.status === 'approved')).length,
          denied: filteredUsers.filter(u => u.courses.some(c => c.certification?.status === 'rejected')).length,
        }}
      />
      
      <CertificateRequirementsBanner 
        minCoursesRequired={certificateSettings.min_courses_required} 
        minWorkshopsRequired={certificateSettings.min_workshops_required} 
      />
      
      {filteredUsers.length === 0 ? (
        <EmptyEligibleUsers status={statusFilter} />
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const course = user.courses.find((c) => c.certification?.status === statusFilter);
            if (!course) return null;
            
            return (
              <div 
                key={`${user.id}-${course.id}`} 
                className="border rounded-lg p-4 bg-white shadow-sm"
              >
                <UserCourseDetails 
                  user={user} 
                  certificateRequirements={certificateSettings}
                />
                
                {statusFilter === "pending" && (
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowRejectionDialog(true);
                      }}
                      className={extendedButtonVariants({ 
                        variant: "outline", 
                        size: "sm",
                        className: "gap-1"
                      })}
                      disabled={isLoading}
                    >
                      <X size={16} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(user.id, course.id)}
                      className={extendedButtonVariants({ 
                        variant: "success", 
                        size: "sm",
                        className: "gap-1" 
                      })}
                      disabled={isLoading}
                    >
                      <Check size={16} />
                      Approve
                    </button>
                  </div>
                )}
                
                {statusFilter === "approved" && (
                  <CertificateActions 
                    userId={user.id}
                    courseId={course.id}
                    approvedDate={course.certification?.approved_at}
                  />
                )}
                
                {statusFilter === "rejected" && (
                  <div className="mt-4 border-t pt-3">
                    <p className="text-sm font-medium">Rejection reason:</p>
                    <p className="text-sm text-gray-600">{course.certification?.reason || "No reason provided"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Rejected on {new Date(course.certification?.rejected_at || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Rejection dialog */}
      {showRejectionDialog && selectedUser && (
        <RejectionDialog
          open={showRejectionDialog}
          onOpenChange={setShowRejectionDialog}
          onConfirm={(reason) => {
            const course = selectedUser.courses.find((c) => c.certification?.status === statusFilter);
            if (course) {
              handleReject(selectedUser.id, course.id, reason);
            }
          }}
        />
      )}
    </div>
  );
}

// Add default export for CertificateManagement
export default CertificateManagement;
