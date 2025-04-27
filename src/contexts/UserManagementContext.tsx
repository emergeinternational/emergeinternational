import React, { createContext, useContext, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserWithRole, UserRole } from '../types/user';

interface UserManagementContextType {
  users: UserWithRole[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  filters: {
    search: string;
    role: string;
    status: string;
  };
  updateUserRole: (userId: string, newRole: UserRole) => Promise<void>;
  updateUserStatus: (userId: string, isActive: boolean) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  setFilters: (filters: Partial<{ search: string; role: string; status: string }>) => void;
  setCurrentPage: (page: number) => void;
  refreshUsers: () => Promise<void>;
}

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);

export const useUserManagement = () => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement must be used within a UserManagementProvider');
  }
  return context;
};

export const UserManagementProvider = ({ children }: { children: React.ReactNode }) => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all'
  });

  const refreshUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (profiles) {
        const formattedUsers: UserWithRole[] = profiles.map(profile => ({
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          role: (profile.role as UserRole) || 'user',
          is_active: profile.is_active,
          created_at: profile.created_at
        }));
        setUsers(formattedUsers);
        setTotalPages(Math.ceil(formattedUsers.length / 10));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      await supabase.rpc('log_user_action', {
        action_type: 'role_updated',
        target_user_id: userId,
        action_details: { new_role: newRole }
      });

      await refreshUsers();
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const updateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) throw error;

      await refreshUsers();
      toast.success('User status updated successfully');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      await refreshUsers();
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const value = {
    users,
    loading,
    currentPage,
    totalPages,
    filters,
    updateUserRole,
    updateUserStatus,
    deleteUser,
    setFilters: updateFilters,
    setCurrentPage,
    refreshUsers
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};
