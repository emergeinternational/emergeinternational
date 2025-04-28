
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserRoleManager } from './UserRoleManager';
import { UserFilterState } from './UserFilters';

type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
};

interface UserManagementProps {
  users?: User[];
}

const UserManagement: React.FC<UserManagementProps> = ({ users: initialUsers = [] }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [confirmDelete, setConfirmDelete] = useState('');

  useEffect(() => {
    if (initialUsers && initialUsers.length > 0) {
      setUsers(initialUsers);
      setLoading(false);
      return;
    }
    
    fetchUsers();
  }, [initialUsers]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles which contain users with roles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at');

      if (profilesError) {
        throw profilesError;
      }

      // Get user authentication data
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        throw authError;
      }

      // Combine the data
      const usersData = profilesData.map((profile: any) => {
        const authUser = authData.users.find((u: any) => u.id === profile.id);
        return {
          ...profile,
          last_sign_in_at: authUser?.last_sign_in_at || null,
        };
      });

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Delete from auth (this will cascade to profiles due to references)
      const { error } = await supabase.auth.admin.deleteUser(selectedUser.id);
      
      if (error) throw error;
      
      setUsers(users.filter(user => user.id !== selectedUser.id));
      toast.success(`User ${selectedUser.email} has been deleted`);
      setIsDeleteDialogOpen(false);
      setConfirmDelete('');
      setSelectedUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleRoleUpdate = () => {
    // Refresh user data after role update
    fetchUsers();
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleRoleChange = (value: string) => {
    setRole(value === 'all' ? null : value);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      !searchQuery || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !role || user.role === role;
    
    return matchesSearch && matchesRole;
  });

  // Simple filter components for this component
  const FilterBar = () => (
    <div className="flex flex-wrap gap-4 mb-6">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="w-[150px]">
        <Select value={role || 'all'} onValueChange={handleRoleChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <FilterBar />
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4">User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Loading user data...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <UserRoleManager 
                      userId={user.id}
                      userEmail={user.email}
                      currentRole={user.role}
                      onRoleUpdated={handleRoleUpdate}
                    />
                  </TableCell>
                  <TableCell>
                    {user.created_at && new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.last_sign_in_at 
                      ? new Date(user.last_sign_in_at).toLocaleDateString() 
                      : 'Never'}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Are you sure you want to delete {selectedUser?.email}? This action cannot be undone.
            </p>
            <div>
              <label htmlFor="confirm" className="text-sm font-medium">
                Type "delete" to confirm:
              </label>
              <Input 
                id="confirm"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={confirmDelete !== 'delete'}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
