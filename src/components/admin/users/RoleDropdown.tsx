
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole, UserWithRole } from '@/types/user';

interface RoleDropdownProps {
  user: UserWithRole;
  onRoleChange: (userId: string, newRole: UserRole) => void;
  disabled?: boolean;
}

const RoleDropdown = ({ user, onRoleChange, disabled = false }: RoleDropdownProps) => {
  return (
    <Select
      value={user.role}
      onValueChange={(value: UserRole) => onRoleChange(user.id, value)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="viewer">Viewer</SelectItem>
        <SelectItem value="user">User</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default RoleDropdown;
