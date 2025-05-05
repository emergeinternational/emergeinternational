
import React from "react";
import { Badge } from "@/components/ui/badge";
import { StatusBadgeProps } from "@/types/shopSubmission";

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Defensive check for valid status
  const validStatus = status && ['draft', 'pending', 'published', 'rejected'].includes(status) 
    ? status 
    : 'draft'; // Default fallback
  
  const getStatusColor = () => {
    switch (validStatus) {
      case "draft":
        return "bg-gray-400 hover:bg-gray-500";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600 text-black";
      case "published":
        return "bg-green-500 hover:bg-green-600";
      case "rejected":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500";
    }
  };
  
  const getStatusLabel = () => {
    switch (validStatus) {
      case "draft":
        return "Draft";
      case "pending":
        return "Pending Review";
      case "published":
        return "Published";
      case "rejected":
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  return (
    <Badge className={`${getStatusColor()} capitalize`}>
      {getStatusLabel()}
    </Badge>
  );
};

export default StatusBadge;
