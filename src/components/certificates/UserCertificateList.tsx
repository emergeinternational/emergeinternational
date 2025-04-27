
import { useState, useEffect } from "react";
import { getUserCertificates, downloadCertificate } from "@/services/certificateService";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Award, Download, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const UserCertificateList = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserCertificates();
    }
  }, [user]);

  const fetchUserCertificates = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const data = await getUserCertificates(user.id);
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast({
        title: "Error",
        description: "Failed to load your certificates. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (certificateId: string, courseTitle: string) => {
    setDownloadingId(certificateId);
    try {
      const result = await downloadCertificate(certificateId);
      
      if (result.success && result.data) {
        // Convert base64 to blob
        const byteCharacters = atob(result.data);
        const byteArrays = [];
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArrays.push(byteCharacters.charCodeAt(i));
        }
        const byteArray = new Uint8Array(byteArrays);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${courseTitle.replace(/\s+/g, '-').toLowerCase()}-certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Success",
          description: "Certificate downloaded successfully",
        });
      } else {
        throw new Error(result.error || "Failed to download certificate");
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast({
        title: "Error",
        description: "Failed to download certificate. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerge-gold" />
        <p className="mt-4 text-sm text-gray-500">Loading certificates...</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
        <Award className="h-12 w-12 mx-auto mb-4 text-emerge-gold/60" />
        <h3 className="text-lg font-medium mb-2">No Certificates Available</h3>
        <p className="text-gray-600 mb-4">
          You don't have any certificates yet. Complete courses and workshops to earn certificates.
        </p>
        <Button 
          variant="outline"
          onClick={() => window.location.href = '/education'}
          className="mt-2"
        >
          Explore Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <Award className="h-5 w-5 mr-2 text-emerge-gold" />
          Your Certificates
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchUserCertificates}
        >
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((certificate) => (
          <Card key={certificate.id} className="border-2 border-gray-100 hover:border-emerge-gold transition-colors">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-lg flex items-start gap-2">
                <Award className="h-5 w-5 text-emerge-gold flex-shrink-0 mt-1" />
                <span>{certificate.course_title}</span>
              </CardTitle>
              <CardDescription>
                Issued on {formatDate(certificate.issue_date)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center text-sm text-gray-500">
                <FileText className="h-4 w-4 mr-2" />
                <span>Certificate of Completion</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={() => handleDownload(certificate.id, certificate.course_title)}
                disabled={downloadingId === certificate.id}
                className="w-full"
              >
                {downloadingId === certificate.id ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserCertificateList;
