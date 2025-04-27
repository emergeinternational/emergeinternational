
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Shield, UserCheck, UserX } from "lucide-react";

interface UserStatusBadgeProps {
  role: string;
  isVerified?: boolean;
}

const UserStatusBadge = ({ role, isVerified }: UserStatusBadgeProps) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case 'editor':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'viewer':
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-3 w-3 mr-1" />;
      case 'editor':
        return <UserCheck className="h-3 w-3 mr-1" />;
      case 'viewer':
        return <UserX className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex gap-2">
      <Badge variant="secondary" className={`flex items-center ${getRoleColor(role)}`}>
        {getRoleIcon(role)}
        {role}
      </Badge>
      {isVerified !== undefined && (
        <Badge variant={isVerified ? "success" : "destructive"}>
          {isVerified ? "Verified" : "Unverified"}
        </Badge>
      )}
    </div>
  );
};

export default UserStatusBadge;
