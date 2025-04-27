
import { FileX } from "lucide-react";

export interface EmptyEligibleUsersProps {
  status: string;
}

export const EmptyEligibleUsers = ({ status }: EmptyEligibleUsersProps) => {
  const getMessage = () => {
    switch (status) {
      case "pending":
        return "No pending certificate requests found";
      case "approved":
        return "No approved certificates found";
      case "rejected":
        return "No rejected certificate requests found";
      default:
        return "No certificate requests found";
    }
  };

  return (
    <div className="text-center py-12 border rounded-lg bg-gray-50">
      <div className="flex justify-center mb-4">
        <FileX className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-600">{getMessage()}</h3>
      <p className="text-sm text-gray-500 mt-2">
        {status === "pending"
          ? "When users request certificates, they will appear here for review."
          : status === "approved"
          ? "Approved certificates will be listed here."
          : "Rejected certificate requests will be listed here."}
      </p>
    </div>
  );
};
