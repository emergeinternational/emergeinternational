import { useState, useEffect, useMemo } from "react";
import { 
  Check, 
  X, 
  Shield,
  UserCheck, 
  UserX,
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw
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

interface UserManagementProps {
  users?: UserWithRole[];
  isLocked?: boolean;
}

const UserManagement = ({ users: initialUsers, isLocked = false }: UserManagementProps) => {
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
  
  const filteredUsers = useMemo(() => {
    // Make sure users is an array before trying to filter it
    const userArr = Array.isArray(users) ? users : [];
    
    let result = [...userArr];
    
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
    // Use initialUsers if provided, otherwise fetch users
    if (initialUsers && initialUsers.length > 0) {
      setUsers(initialUsers);
      setLoading(false);
    } else {
      fetchUsers();
    }

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
  }, [initialUsers]);

  const fetchUsers = async () => {
    console.log("Fetching users...");
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

      console.log("Fetched profiles:", profiles);
      
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

      console.log("Fetched user roles:", userRoles);
      
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
        console.log("Enhanced users:", enhancedUsers);
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
    if (isLocked) {
      toast({
        title: "Page is locked",
        description: "Unable to update user role while the page is locked. Please unlock first.",
        variant: "destructive",
      });
      return;
    }
    
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

  const handleDeleteUser = async (userId: string) => {
    if (isLocked) {
      toast({
        title: "Page is locked",
        description: "Unable to delete user while the page is locked. Please unlock first.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Note: Deleting a user from auth.users would normally be done by an admin in the Supabase dashboard
      // Here we'll just remove them from profiles to simulate deletion in our app
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
        .eq('id', userId);
        
      if (error) throw error;
      
      toast({
        title: "User deactivated",
        description: "User has been successfully deactivated from the system.",
      });
      
      // Refresh our user list
      fetchUsers();
      
    } catch (error) {
      console.error('Error deactivating user:', error);
      
      toast({
        title: "Error deactivating user",
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

  return (
    <div className="space-y-4">
      {isLocked && (
        <div className="bg-amber-50 p-4 mb-4 rounded-md border border-amber-200 flex items-center gap-2">
          <Lock className="h-5 w-5 text-amber-500" />
          <div>
            <h3 className="font-medium text-amber-700">Page is locked</h3>
            <p className="text-sm text-amber-600">This page is currently locked. Unlock it to make changes to user roles and permissions.</p>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
      </div>
      
      <UserFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        onRefresh={fetchUsers}
        isLoading={loading}
        activeFilterCount={activeFilterCount}
      />
      
      <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-xs">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">System Diagnostic</h3>
          <Badge variant="secondary">
            {diagnosticInfo.fetchMethod === 'auth-api' ? 'Using Auth API' : 
             diagnosticInfo.fetchMethod === 'profiles-table' ? 'Using Profiles Table' : 
             'Data Source Unknown'}
          </Badge>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-slate-500">Auth Users</p>
            <p className="font-medium">{diagnosticInfo.authUsersCount ?? 'Not available'}</p>
          </div>
          <div>
            <p className="text-slate-500">Profiles</p>
            <p className="font-medium">{diagnosticInfo.profilesCount ?? 'Not available'}</p>
          </div>
          <div>
            <p className="text-slate-500">User Roles</p>
            <p className="font-medium">{diagnosticInfo.userRolesCount ?? 'Not available'}</p>
          </div>
        </div>
        <div className="mt-2 text-slate-500">
          Last refreshed: {diagnosticInfo.lastRefreshed ? formatDate(diagnosticInfo.lastRefreshed) : 'Never'}
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                Loading users...
              </TableCell>
            </TableRow>
          ) : !Array.isArray(filteredUsers) || filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                {Array.isArray(users) && users.length > 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    <p>No users match your current filters</p>
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    <p>No users found in the system</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={fetchUsers}
                      className="flex items-center gap-1"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Refresh
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.map((user) => (
              <TableRow key={user.id} className={user.is_new ? "bg-emerald-50" : undefined}>
                <TableCell>
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium flex items-center">
                        {user.full_name || 'Unnamed User'}
                        {user.is_new && (
                          <Badge variant="secondary" className="ml-2">New</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.id.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className={`flex items-center font-medium ${getRoleColor(user.role || 'user')}`}>
                    {getRoleIcon(user.role || 'user')}
                    {user.role || 'user'}
                  </div>
                </TableCell>
                <TableCell>
                  {user.is_verified ? (
                    <Badge variant="secondary">Verified</Badge>
                  ) : (
                    <Badge variant="outline">Unverified</Badge>
                  )}
                </TableCell>
                <TableCell className="text-sm">
                  <div>{formatDate(user.created_at)}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={user.loading || isLocked}
                          className={user.loading ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          {user.loading ? "Updating..." : "Change Role"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Select Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuRadioGroup 
                          value={user.role || 'user'}
                          onValueChange={(value) => updateUserRole(user.id, value as UserRole)}
                        >
                          <DropdownMenuRadioItem value="admin">
                            <Shield className="h-4 w-4 mr-2" /> Admin
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="editor">
                            <UserCheck className="h-4 w-4 mr-2" /> Editor
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="viewer">
                            <UserX className="h-4 w-4 mr-2" /> Viewer
                          </DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="user">
                            User
                          </DropdownMenuRadioItem>
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          disabled={isLocked}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {!loading && Array.isArray(filteredUsers) && filteredUsers.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          Showing {filteredUsers.length} of {Array.isArray(users) ? users.length : 0} users
          {filteredUsers.filter(u => u.is_new).length > 0 && (
            <span className="ml-1">
              including <span className="font-semibold text-emerald-600">{filteredUsers.filter(u => u.is_new).length} new</span> in the last hour
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
