
import { useState, useEffect } from "react";
import {
  getEligibleUsers,
  updateCertificateApproval,
  generateCertificate,
  getCertificateSettings,
  userMeetsRequirements
} from "../../services/certificateService";
import { useToast } from "@/hooks/use-toast";
import CertificateSettings from "./CertificateSettings";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Award, 
  BookOpen, 
  AlertTriangle,
  Eye,
  Link as ExternalLink,
  Download,
  Settings
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CertificateManagement = () => {
  const { toast } = useToast();
  const [eligibleUsers, setEligibleUsers] = useState<any[]>([]);
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

  useEffect(() => {
    fetchEligibleUsers();
    fetchCertificateSettings();
  }, []);

  const fetchCertificateSettings = async () => {
    try {
      const settings = await getCertificateSettings();
      setCertificateRequirements(settings);
    } catch (error) {
      console.error("Error fetching certificate settings:", error);
    }
  };

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
      const success = await updateCertificateApproval(selectedUser.user_id, true);
      if (success) {
        toast({
          title: "Certificate Approved",
          description: `Certificate for ${selectedUser.profiles?.full_name || selectedUser.profiles?.email || "User"} has been approved.`,
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
      const success = await updateCertificateApproval(selectedUser.user_id, false);
      if (success) {
        toast({
          title: "Certificate Revoked",
          description: `Certificate for ${selectedUser.profiles?.full_name || selectedUser.profiles?.email || "User"} has been revoked.`,
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

  const handleGenerateCertificate = async () => {
    if (!selectedUser) return;
    
    setGeneratingCertificate(true);
    try {
      // For this example, we're using a fixed course title
      // In a real application, you might want to select the specific course
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

  const getUserCourseDetails = (user: any) => {
    return {
      embeddedCoursesWatched: [
        { title: "Fashion Design 101", watchPercent: 95, date: "2023-05-15" },
        { title: "Advanced Pattern Making", watchPercent: 98, date: "2023-05-20" },
      ],
      externalCoursesVisited: [
        { title: "Digital Fashion Marketing", visitDate: "2023-05-18" },
        { title: "Sustainable Fashion", visitDate: "2023-05-25" },
      ],
      workshopsAttended: [
        { title: "Acting for Models Workshop", date: "2023-06-01" },
        { title: "Portfolio Development", date: "2023-06-15" },
      ],
    };
  };

  const hasMetRequirements = (user: any) => {
    if (!user) return false;
    // Add null check for online_courses_completed and workshops_completed
    const onlineCoursesCompleted = user.online_courses_completed || 0;
    const workshopsCompleted = user.workshops_completed || 0;
    return onlineCoursesCompleted >= certificateRequirements.min_courses_required && 
           workshopsCompleted >= certificateRequirements.min_workshops_required;
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
      </div>

      <div className="bg-emerge-cream p-4 rounded border border-amber-200">
        <h3 className="font-medium flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
          Certificate Requirements
        </h3>
        <ul className="mt-2 text-sm space-y-1">
          <li>• Minimum of {certificateRequirements.min_courses_required} online courses completed</li>
          <li>• Minimum of {certificateRequirements.min_workshops_required} workshops attended</li>
          <li>• Manual admin verification required for all certificates</li>
        </ul>
      </div>

      {!loading && eligibleUsers.length === 0 ? (
        <div className="bg-emerge-cream p-8 text-center rounded-md">
          <BookOpen className="h-12 w-12 mx-auto mb-2 text-emerge-gold/60" />
          <h3 className="text-lg font-medium mb-1">No Eligible Users Found</h3>
          <p className="text-gray-600">
            Users need to complete at least {certificateRequirements.min_courses_required} online courses and {certificateRequirements.min_workshops_required} workshops to be eligible.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-md border overflow-hidden">
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-gray-500">Loading eligible users...</p>
                  </TableCell>
                </TableRow>
              ) : (
                eligibleUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.profiles?.full_name || "Unnamed User"}</p>
                        <p className="text-sm text-gray-500">{user.profiles?.email || "No email"}</p>
                        <p className="text-xs text-gray-400">Eligible since: {formatDate(user.created_at)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${(user.online_courses_completed || 0) >= certificateRequirements.min_courses_required ? "bg-green-500" : "bg-amber-500"} mr-2`}></div>
                        <span>{user.online_courses_completed || 0} online courses</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full ${(user.workshops_completed || 0) >= certificateRequirements.min_workshops_required ? "bg-green-500" : "bg-amber-500"} mr-2`}></div>
                        <span>{user.workshops_completed || 0} workshops</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasMetRequirements(user) ? (
                        <Badge variant="success" className="flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          All Met
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center text-amber-600 border-amber-600">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Not Met
                        </Badge>
                      )}
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
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </Button>
                        
                        {user.admin_approved ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-300 hover:bg-green-50"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowGenerateDialog(true);
                              }}
                            >
                              <Award className="h-4 w-4 mr-1" />
                              Generate
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 border-red-300 hover:bg-red-50"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowRevocationDialog(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Revoke
                            </Button>
                          </>
                        ) : hasMetRequirements(user) && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-300 hover:bg-green-50"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowApprovalDialog(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                      </div>
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
              Are you sure you want to approve a certificate for {selectedUser?.profiles?.full_name || selectedUser?.profiles?.email || "this user"}?
              This will allow the user to download their certificate immediately.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="my-4 p-4 bg-gray-50 rounded border">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="font-medium">Online Courses:</p>
                  <p>{selectedUser.online_courses_completed || 0} completed</p>
                  <p className="text-xs text-gray-500">Required: {certificateRequirements.min_courses_required}</p>
                </div>
                <div>
                  <p className="font-medium">Workshops:</p>
                  <p>{selectedUser.workshops_completed || 0} completed</p>
                  <p className="text-xs text-gray-500">Required: {certificateRequirements.min_workshops_required}</p>
                </div>
              </div>
            </div>
          )}
          
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
              disabled={actionLoading || (selectedUser && !hasMetRequirements(selectedUser))}
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

      {/* Generate Certificate Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Certificate</DialogTitle>
            <DialogDescription>
              Generate a certificate for {selectedUser?.profiles?.full_name || selectedUser?.profiles?.email || "this user"}.
              This will create a downloadable certificate for the user.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="my-4 p-4 bg-gray-50 rounded border">
              <div className="space-y-4">
                <div>
                  <p className="font-medium">User:</p>
                  <p>{selectedUser.profiles?.full_name || selectedUser.profiles?.email || "Unnamed User"}</p>
                </div>
                <div>
                  <p className="font-medium">Course:</p>
                  <p>Fashion Design & Model Development</p>
                </div>
                <div>
                  <p className="font-medium">Certificate Format:</p>
                  <p>PDF - Professional Design with Signature</p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowGenerateDialog(false)}
              disabled={generatingCertificate}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerateCertificate}
              disabled={generatingCertificate || !selectedUser?.admin_approved}
              className="bg-emerge-gold hover:bg-emerge-gold/90"
            >
              {generatingCertificate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Award className="h-4 w-4 mr-2" />
                  Generate Certificate
                </>
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
              Are you sure you want to revoke the certificate for {selectedUser?.profiles?.full_name || selectedUser?.profiles?.email || "this user"}?
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
      
      {/* User Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>User Course & Workshop Details</DialogTitle>
            <DialogDescription>
              Detailed information about course completion and workshop attendance for {selectedUser?.profiles?.full_name || selectedUser?.profiles?.email || "this user"}.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded border">
                  <h3 className="font-medium flex items-center">
                    <BookOpen className="h-4 w-4 mr-2 text-emerge-gold" />
                    Online Course Progress
                  </h3>
                  <p className="text-lg font-bold mt-1">{selectedUser.online_courses_completed || 0} courses</p>
                  <p className="text-xs text-gray-500">Minimum required: {certificateRequirements.min_courses_required}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded border">
                  <h3 className="font-medium flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 text-emerge-gold" />
                    Workshop Attendance
                  </h3>
                  <p className="text-lg font-bold mt-1">{selectedUser.workshops_completed || 0} workshops</p>
                  <p className="text-xs text-gray-500">Minimum required: {certificateRequirements.min_workshops_required}</p>
                </div>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {getUserCourseDetails(selectedUser).embeddedCoursesWatched.length > 0 && (
                  <AccordionItem value="embedded-courses">
                    <AccordionTrigger>
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Embedded Courses Watched
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course Title</TableHead>
                            <TableHead>Watch Percentage</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getUserCourseDetails(selectedUser).embeddedCoursesWatched.map((course, index) => (
                            <TableRow key={index}>
                              <TableCell>{course.title}</TableCell>
                              <TableCell>{course.watchPercent}%</TableCell>
                              <TableCell>{formatDate(course.date)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                )}
                  
                {getUserCourseDetails(selectedUser).externalCoursesVisited.length > 0 && (
                  <AccordionItem value="external-courses">
                    <AccordionTrigger>
                      <span className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-2 text-blue-600" />
                        External Courses Visited
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Course Title</TableHead>
                            <TableHead>Visit Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getUserCourseDetails(selectedUser).externalCoursesVisited.map((course, index) => (
                            <TableRow key={index}>
                              <TableCell>{course.title}</TableCell>
                              <TableCell>{formatDate(course.visitDate)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                )}
                  
                {getUserCourseDetails(selectedUser).workshopsAttended.length > 0 && (
                  <AccordionItem value="workshops">
                    <AccordionTrigger>
                      <span className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-emerge-gold" />
                        Workshops Attended
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Workshop Title</TableHead>
                            <TableHead>Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {getUserCourseDetails(selectedUser).workshopsAttended.map((workshop, index) => (
                            <TableRow key={index}>
                              <TableCell>{workshop.title}</TableCell>
                              <TableCell>{formatDate(workshop.date)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </div>
          )}
          
          <DialogFooter>
            {selectedUser && !selectedUser.admin_approved && hasMetRequirements(selectedUser) && (
              <Button 
                onClick={() => {
                  setShowDetailsDialog(false);
                  setShowApprovalDialog(true);
                }}
                className="bg-emerge-gold hover:bg-emerge-gold/90"
              >
                Approve Certificate
              </Button>
            )}
            
            {selectedUser && selectedUser.admin_approved && (
              <Button 
                onClick={() => {
                  setShowDetailsDialog(false);
                  setShowGenerateDialog(true);
                }}
                className="bg-emerge-gold hover:bg-emerge-gold/90"
              >
                <Award className="h-4 w-4 mr-2" />
                Generate Certificate
              </Button>
            )}
            
            <Button 
              variant="outline" 
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CertificateManagement;
