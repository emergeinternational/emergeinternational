
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoleFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const RoleFilter = ({ value, onChange }: RoleFilterProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px] h-10">
        <SelectValue placeholder="Filter by role" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Roles</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="editor">Editor</SelectItem>
        <SelectItem value="viewer">Viewer</SelectItem>
        <SelectItem value="user">User</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default RoleFilter;
