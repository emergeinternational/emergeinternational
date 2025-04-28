
import React from 'react';
import { useAdminUsers, AdminViewAccessCheck } from './AdminUsersFetcher';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const AdminUsersTable: React.FC = () => {
  const { adminUsers, loading, error, refreshAdminUsers } = useAdminUsers();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-300 rounded-md p-4 bg-red-50">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Admin Users</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error.message}</p>
              <p className="mt-2">
                This could be due to permission issues or the updated security model requires additional configuration.
              </p>
            </div>
            <div className="mt-4">
              <Button
                variant="outline" 
                size="sm" 
                onClick={refreshAdminUsers}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <AdminViewAccessCheck />
        </div>
      </div>
    );
  }

  if (!adminUsers || adminUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-4">
          <AlertCircle className="h-6 w-6 text-yellow-600" />
        </div>
        <h3 className="text-sm font-medium">No Admin Users Found</h3>
        <p className="mt-2 text-sm text-gray-500">
          Either there are no admin users in the system, or you don't have permission to view them.
        </p>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={refreshAdminUsers}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
        <div className="mt-6">
          <AdminViewAccessCheck />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Admin Users</h2>
        <Button variant="outline" size="sm" onClick={refreshAdminUsers}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Table>
        <TableCaption>List of users with admin role</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Last Sign In</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adminUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.email}</TableCell>
              <TableCell>{formatDate(user.created_at)}</TableCell>
              <TableCell>{user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm">Active</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="mt-4">
        <AdminViewAccessCheck />
      </div>
    </div>
  );
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} (${formatDistanceToNow(date, { addSuffix: true })})`;
  } catch (e) {
    return 'Invalid date';
  }
};
