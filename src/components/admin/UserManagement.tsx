import { useState, useEffect, useMemo } from "react";
import { 
  Check, 
  X, 
  Shield,
  UserCheck, 
  UserX,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import UserFilters, { UserFilterState, DateRange } from "./UserFilters";
import { useAuth } from "@/hooks/useAuth";
import UserListHeader from "./users/UserListHeader";
import UserStatusBadge from "./users/UserStatusBadge";
import UserManagementActions from "./users/UserManagementActions";

type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  loading?: boolean;
  created_at?: string;
  is_new?: boolean;
  is_verified?: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilterState>({
    search: '',
    role: 'all',
    dateRange: 'all-time',
    verified: null,
    showAllUsers: true
  });
  const [diagnosticInfo, setDiagnosticInfo] = useState<{
    authUsersCount: number | null;
    profilesCount: number | null;
    userRolesCount: number | null;
    lastRefreshed: string | null;
    fetchMethod: 'auth-api' | 'profiles-table' | 'unknown';
  }>({
    authUsersCount: null,
    profilesCount: null,
    userRolesCount: null,
    lastRefreshed: null,
    fetchMethod: 'unknown',
  });
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  
  const filteredUsers = useMemo(() => {
    let result = [...users];
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(user => 
        (user.full_name && user.full_name.toLowerCase().includes(searchLower)) || 
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }
    
    if (filters.role !== 'all') {
      result = result.filter(user => user.role === filters.role);
    }
    
    if (filters.dateRange !== 'all-time' && result.length > 0) {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'this-week': {
          const day = now.getDay();
          startDate = new Date(now);
          startDate.setDate(now.getDate() - day);
          startDate.setHours(0, 0, 0, 0);
          break;
        }
        case 'last-30-days':
          startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate = new Date(0);
      }
      
      result = result.filter(user => {
        if (!user.created_at) return false;
        const userCreatedAt = new Date(user.created_at);
        return userCreatedAt >= startDate;
      });
    }
    
    if (filters.verified !== null) {
      result = result.filter(user => user.is_verified === filters.verified);
    }
    
    return result;
  }, [users, filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role !== 'all') count++;
    if (filters.dateRange !== 'all-time') count++;
    if (filters.verified !== null) count++;
    return count;
  }, [filters]);
  
  const handleFilterChange = (newFilters: Partial<UserFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  const resetFilters = () => {
    setFilters({
      search: '',
      role: 'all',
      dateRange: 'all-time',
      verified: null,
      showAllUsers: true
    });
  };
  
  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('user_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change detected:', payload);
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, created_at');
        
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        setDiagnosticInfo(prev => ({
          ...prev,
          profilesCount: 0,
          fetchMethod: 'profiles-table'
        }));
        throw profilesError;
      }
      
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        setDiagnosticInfo(prev => ({
          ...prev,
          userRolesCount: 0
        }));
        throw rolesError;
      }
      
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      if (profiles) {
        const enhancedUsers: UserWithRole[] = profiles.map(profile => {
          const userRole = userRoles?.find(ur => ur.user_id === profile.id);
          
          return {
            id: profile.id,
            email: profile.email || 'No Email',
            full_name: profile.full_name || 'Unnamed User',
            role: (userRole?.role as UserRole) || profile.role as UserRole || 'user',
            created_at: profile.created_at,
            is_new: profile.created_at ? new Date(profile.created_at) > oneHourAgo : false,
            is_verified: Boolean(profile.email && profile.full_name)
          };
        });
        
        setUsers(enhancedUsers);
        setDiagnosticInfo(prev => ({
          ...prev,
          profilesCount: profiles.length,
          userRolesCount: userRoles?.length || 0,
          lastRefreshed: new Date().toISOString(),
          fetchMethod: 'profiles-table'
        }));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserRole = async (userId: string, newRole: UserRole) => {
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, loading: true } : u
      )
    );
    
    try {
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      let userRolesSuccess = false;
      
      if (existingRole) {
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
          
        if (!updateError) {
          userRolesSuccess = true;
        } else {
          console.error("Error updating user_roles:", updateError);
        }
      } else {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
          
        if (!insertError) {
          userRolesSuccess = true;
        } else {
          console.error("Error inserting into user_roles:", insertError);
        }
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (profileError) {
        console.error("Error updating profile role:", profileError);
      }
      
      if (userRolesSuccess || !profileError) {
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, role: newRole, loading: false } : u
          )
        );
        
        toast({
          title: "Role updated successfully",
          description: `User role has been updated to ${newRole}`,
          variant: "default"
        });
      } else {
        throw new Error("Failed to update role in both tables");
      }
      
    } catch (error) {
      console.error('Error updating role:', error);
      
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, loading: false } : u
        )
      );
      
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    }
  };
  
  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return "text-red-600";
      case 'editor':
        return "text-blue-600";
      case 'viewer':
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };
  
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 mr-1" />;
      case 'editor':
        return <UserCheck className="h-4 w-4 mr-1" />;
      case 'viewer':
        return <UserX className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      
      toast({
        title: "User deleted successfully",
        description: "The user has been removed from the system.",
      });
      
      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: UserWithRole) => {
    // Placeholder for edit functionality
    toast({
      title: "Edit User",
      description: `Editing user ${user.full_name} is not yet implemented.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    // Placeholder for delete functionality
    toast({
      title: "Delete User",
      description: `Deleting user with ID ${userId} is not yet implemented.`,
    });
  };

  return (
    <div className="space-y-4">
      <UserListHeader 
        onAddUser={() => setOpenAddUserDialog(true)}
        totalUsers={users.length}
      />
      
      <UserFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        onRefresh={fetchUsers}
        isLoading={loading}
        activeFilterCount={activeFilterCount}
      />

      <div className="bg-white rounded-lg shadow">
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.full_name || 'Unnamed User'}</div>
                    <div className="text-sm text-muted-foreground">ID: {user.id.slice(0, 8)}...</div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <UserStatusBadge 
                      role={user.role || 'user'} 
                      isVerified={user.is_verified}
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.created_at)}</TableCell>
                  <TableCell>
                    <UserManagementActions
                      onEdit={() => handleEditUser(user)}
                      onDelete={() => handleDeleteUser(user.id)}
                      isCurrentUser={user.id === currentUser?.id}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserManagement;
