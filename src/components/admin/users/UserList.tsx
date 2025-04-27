
import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import { UserWithRole, UserRole } from '../../../types/user';
import UserStatusBadge from './UserStatusBadge';
import UserManagementActions from './UserManagementActions';

interface UserListProps {
  users: UserWithRole[];
  isLoading: boolean;
  currentUserId?: string;
  onEditUser: (user: UserWithRole) => void;
  onDeleteUser: (userId: string) => void;
  onStatusChange: (userId: string, status: boolean) => void;
  onRoleChange: (userId: string, role: UserRole) => void;
}

const UserList = ({
  users,
  isLoading,
  currentUserId,
  onEditUser,
  onDeleteUser,
  onStatusChange,
  onRoleChange
}: UserListProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="w-[80px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">
              Loading users...
            </TableCell>
          </TableRow>
        ) : users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8">
              No users found
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                <div className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <UserStatusBadge 
                  role={user.role || 'user'} 
                  isActive={user.is_active}
                />
              </TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell>
                <UserManagementActions
                  userId={user.id}
                  onEdit={() => onEditUser(user)}
                  onDelete={() => onDeleteUser(user.id)}
                  onStatusChange={(status) => onStatusChange(user.id, status)}
                  onRoleChange={(role) => onRoleChange(user.id, role)}
                  isCurrentUser={user.id === currentUserId}
                  currentRole={user.role}
                  isActive={user.is_active}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default UserList;
