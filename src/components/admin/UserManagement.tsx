
import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, UserPlus, PenLine, ShieldAlert, Shield, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UserFilters from './UserFilters';

type User = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  last_sign_in_at: string | null;
};

type UserRole = {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
};

const UserManagement = ({ users: initialUsers = [] }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [role, setRole] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<string>('user');
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

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    
    try {
      // Update the role in the profiles table directly
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: editRole })
        .eq('id', selectedUser.id);

      if (updateError) throw updateError;
      
      setUsers(users.map(user => 
        user.id === selectedUser.id 
          ? { ...user, role: editRole } 
          : user
      ));
      
      toast.success(`Updated ${selectedUser.email}'s role to ${editRole}`);
      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(`Failed to update role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role || 'user');
    setIsEditDialogOpen(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      !searchQuery || 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !role || user.role === role;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500"><ShieldAlert className="h-3 w-3 mr-1" />Admin</Badge>;
      case 'editor':
        return <Badge className="bg-amber-500"><PenLine className="h-3 w-3 mr-1" />Editor</Badge>;
      case 'viewer':
        return <Badge className="bg-blue-500"><Shield className="h-3 w-3 mr-1" />Viewer</Badge>;
      default:
        return <Badge className="bg-gray-500"><User className="h-3 w-3 mr-1" />User</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <UserFilters 
        onSearchChange={setSearchQuery}
        onRoleChange={setRole}
        searchQuery={searchQuery}
        role={role}
      />
      
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
                    {getRoleBadge(user.role)}
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
                      onClick={() => openEditDialog(user)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDeleteDialog(user)}
                      className="text-red-500 hover:text-red-700"
                    >
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
      
      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Update role for {selectedUser?.email}
            </p>
            <div>
              <label htmlFor="role" className="text-sm font-medium">
                User Role
              </label>
              <Select 
                value={editRole} 
                onValueChange={setEditRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="user">Regular User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateRole}
            >
              Update Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
