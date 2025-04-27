
import React from 'react';
import { MoreHorizontal, Pencil, Trash2, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import RoleDropdown from './RoleDropdown';
import { UserRole } from '@/types/user';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserManagementActionsProps {
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: boolean) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
  isCurrentUser: boolean;
  currentRole?: UserRole;
  isActive?: boolean;
  userId: string;
}

const UserManagementActions = ({
  onEdit,
  onDelete,
  onStatusChange,
  onRoleChange,
  isCurrentUser,
  currentRole = 'user',
  isActive = true,
  userId
}: UserManagementActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
          <Pencil className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Shield className="mr-2 h-4 w-4" />
          <RoleDropdown 
            user={{ id: userId, role: currentRole, email: '', full_name: null }}
            onRoleChange={onRoleChange}
            disabled={isCurrentUser}
          />
        </DropdownMenuItem>

        <DropdownMenuItem 
          onSelect={(e) => {
            e.preventDefault();
            onStatusChange(!isActive);
          }}
        >
          <div className="flex items-center space-x-2">
            <span>Active</span>
            <Switch checked={isActive} />
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="cursor-pointer text-red-600"
              disabled={isCurrentUser}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the user
                account and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete} className="bg-red-600">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserManagementActions;
