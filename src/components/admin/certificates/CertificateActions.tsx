
import { Button } from "@/components/ui/button";
import { Award, CheckCircle, Eye, XCircle } from "lucide-react";

interface CertificateActionsProps {
  user: any;
  hasMetRequirements: boolean;
  onViewDetails: () => void;
  onApprove: () => void;
  onGenerate: () => void;
  onRevoke: () => void;
}

export const CertificateActions = ({
  user,
  hasMetRequirements,
  onViewDetails,
  onApprove,
  onGenerate,
  onRevoke,
}: CertificateActionsProps) => {
  return (
    <div className="space-x-2">
      <Button
        variant="outline"
        size="sm"
        className="text-blue-600 border-blue-300 hover:bg-blue-50"
        onClick={onViewDetails}
      >
        <Eye className="h-4 w-4 mr-1" />
        Details
      </Button>
      
      {/* Always show Generate button for testing - no conditions */}
      <Button
        variant="outline"
        size="sm"
        className="text-green-600 border-green-300 hover:bg-green-50"
        onClick={onGenerate}
      >
        <Award className="h-4 w-4 mr-1" />
        Generate
      </Button>
      
      {!user.admin_approved && hasMetRequirements && (
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 border-green-300 hover:bg-green-50"
          onClick={onApprove}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Approve
        </Button>
      )}
      
      {user.admin_approved && (
        <Button
          variant="outline"
          size="sm"
          className="text-red-500 border-red-300 hover:bg-red-50"
          onClick={onRevoke}
        >
          <XCircle className="h-4 w-4 mr-1" />
          Revoke
        </Button>
      )}
    </div>
  );
};
