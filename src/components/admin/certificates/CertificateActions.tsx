
import { useState } from "react";
import { CheckCircle, Download, Printer, Share2 } from "lucide-react";
import { extendedButtonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/utils/date";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { downloadCertificate } from "@/services/certificate/index";

export interface CertificateActionsProps {
  userId: string;
  courseId: string;
  approvedDate?: string;
}

export const CertificateActions = ({ userId, courseId, approvedDate }: CertificateActionsProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // In a real implementation, this would download the certificate PDF
      await downloadCertificate(userId);
      toast({
        title: "Certificate downloaded",
        description: "The certificate has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the certificate.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-4 border-t pt-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium">Approved</span>
          <Badge variant="success" className="ml-2">
            Valid
          </Badge>
        </div>
        {approvedDate && (
          <span className="text-xs text-gray-500">
            Issued on {formatDate(approvedDate)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          className={extendedButtonVariants({
            variant: "outline",
            size: "sm",
            className: "gap-1"
          })}
          disabled={isDownloading}
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Downloading..." : "Download Certificate"}
        </button>
        
        <button
          className={extendedButtonVariants({
            variant: "outline",
            size: "sm",
            className: "gap-1"
          })}
        >
          <Printer className="h-4 w-4" />
          Print Certificate
        </button>
        
        <button
          className={extendedButtonVariants({
            variant: "outline",
            size: "sm",
            className: "gap-1"
          })}
        >
          <Share2 className="h-4 w-4" />
          Share Certificate
        </button>
      </div>
    </div>
  );
};
