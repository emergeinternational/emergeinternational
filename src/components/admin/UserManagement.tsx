
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Define basic user props interface
export interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  role?: string;
  account_status?: 'active' | 'suspended' | 'deleted';
}

// Define UserManagement props interface
export interface UserManagementProps {
  users: User[];
  onRoleChange?: (userId: string, role: string) => void;
  onStatusChange?: (userId: string, status: 'active' | 'suspended' | 'deleted') => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ 
  users,
  onRoleChange,
  onStatusChange
}) => {
  const { toast } = useToast();
  const [activeUser, setActiveUser] = useState<User | null>(null);
  
  const handleRoleChange = (userId: string, role: string) => {
    if (onRoleChange) {
      onRoleChange(userId, role);
      toast({
        title: "Role Updated",
        description: `User role updated to ${role}`
      });
    }
  };
  
  const handleStatusChange = (userId: string, status: 'active' | 'suspended' | 'deleted') => {
    if (onStatusChange) {
      onStatusChange(userId, status);
      toast({
        title: "Status Updated",
        description: `User status updated to ${status}`
      });
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Active
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.email}</div>
                  <div className="text-xs text-gray-500">{user.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select 
                    value={user.role || 'user'} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select 
                    value={user.account_status || 'active'} 
                    onChange={(e) => handleStatusChange(user.id, e.target.value as 'active' | 'suspended' | 'deleted')}
                    className="block w-full mt-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="deleted">Deleted</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setActiveUser(user)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
