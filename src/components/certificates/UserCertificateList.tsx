
import { useState, useEffect } from "react";
import { getUserCertificates, downloadCertificate } from "@/services/certificateService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  Award, 
  Download, 
  Calendar, 
  ClipboardCheck,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const UserCertificateList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserCertificates();
    }
  }, [user]);

  const fetchUserCertificates = async () => {
    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error("User ID not available");
      }
      
      const data = await getUserCertificates(user.id);
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast({
        title: "Error",
        description: "Failed to load your certificates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId: string, courseTitle: string) => {
    setDownloading(certificateId);
    try {
      const result = await downloadCertificate(certificateId);
      
      if (!result.success || !result.data) {
        throw new Error(result.error || "Failed to download certificate");
      }
      
      // Create a download link for the PDF
      const linkSource = `data:application/pdf;base64,${result.data}`;
      const downloadLink = document.createElement("a");
      const fileName = `certificate-${courseTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
      
      toast({
        title: "Certificate Downloaded",
        description: "Your certificate has been downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download your certificate",
        variant: "destructive",
      });
    } finally {
      setDownloading(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold flex items-center">
            <Award className="mr-2 h-5 w-5 text-emerge-gold" />
            Your Certificates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Download and access your earned certificates
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={fetchUserCertificates} 
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-emerge-gold" />
          <p className="mt-4 text-muted-foreground">Loading your certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-muted/20">
          <Award className="h-12 w-12 mx-auto text-muted-foreground/60" />
          <h3 className="mt-4 font-medium text-lg">No Certificates Found</h3>
          <p className="text-muted-foreground max-w-md mx-auto mt-2">
            You don't have any certificates yet. Complete courses and workshops to become eligible for certification.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {certificates.map((cert) => (
            <Card key={cert.id} className="p-6 flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-emerge-gold mr-3" />
                  <div>
                    <h3 className="font-semibold text-lg">{cert.course_title}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Issued: {formatDate(cert.issue_date)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => handleDownload(cert.id, cert.course_title)}
                  disabled={downloading === cert.id}
                >
                  {downloading === cert.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  <span>Download</span>
                </Button>
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center">
                  <ClipboardCheck className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm">Certificate ID: {cert.id.substring(0, 8).toUpperCase()}</span>
                </div>
                {cert.expiry_date && (
                  <div className="flex items-center mt-1">
                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                    <span className="text-sm">Expires: {formatDate(cert.expiry_date)}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCertificateList;
