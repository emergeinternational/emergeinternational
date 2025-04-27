
import React from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface UserListHeaderProps {
  onAddUser: () => void;
  totalUsers: number;
}

const UserListHeader = ({ onAddUser, totalUsers }: UserListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-lg font-semibold">User List</h2>
        <p className="text-sm text-muted-foreground">
          Manage {totalUsers} user{totalUsers !== 1 ? 's' : ''}
        </p>
      </div>
      <Button onClick={onAddUser} className="flex items-center gap-2">
        <UserPlus className="h-4 w-4" />
        Add User
      </Button>
    </div>
  );
};

export default UserListHeader;
