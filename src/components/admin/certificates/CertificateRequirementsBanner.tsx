
import { AlertTriangle } from "lucide-react";

interface CertificateRequirementsBannerProps {
  minCoursesRequired: number;
  minWorkshopsRequired: number;
}

export const CertificateRequirementsBanner = ({
  minCoursesRequired,
  minWorkshopsRequired
}: CertificateRequirementsBannerProps) => {
  return (
    <div className="bg-emerge-cream p-4 rounded border border-amber-200">
      <h3 className="font-medium flex items-center">
        <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
        Certificate Requirements
      </h3>
      <ul className="mt-2 text-sm space-y-1">
        <li>• Minimum of {minCoursesRequired} online courses completed</li>
        <li>• Minimum of {minWorkshopsRequired} workshops attended</li>
        <li>• Manual admin verification required for all certificates</li>
      </ul>
    </div>
  );
};
