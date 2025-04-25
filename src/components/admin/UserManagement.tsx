
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
  
  // Filter users based on current filter state
  const filteredUsers = useMemo(() => {
    let result = [...users];
    
    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(user => 
        (user.full_name && user.full_name.toLowerCase().includes(searchLower)) || 
        (user.email && user.email.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply role filter
    if (filters.role !== 'all') {
      result = result.filter(user => user.role === filters.role);
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all-time' && result.length > 0) {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'this-week': {
          // Set to beginning of current week (Sunday)
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
          startDate = new Date(0); // Beginning of time
      }
      
      result = result.filter(user => {
        if (!user.created_at) return false;
        const userCreatedAt = new Date(user.created_at);
        return userCreatedAt >= startDate;
      });
    }
    
    // Apply verification filter
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
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get profiles for additional user data
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
      } else {
        setDiagnosticInfo(prev => ({
          ...prev,
          profilesCount: profiles?.length || 0
        }));
      }
      
      // Get user roles from the new user_roles table
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) {
        console.error('Error fetching user roles:', rolesError);
        setDiagnosticInfo(prev => ({
          ...prev,
          userRolesCount: 0
        }));
      } else {
        setDiagnosticInfo(prev => ({
          ...prev,
          userRolesCount: userRoles?.length || 0
        }));
      }
      
      // Current time to identify new users (less than 1 hour old)
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      if (profiles) {
        // Map profiles with roles
        const enhancedUsers: UserWithRole[] = profiles.map(profile => {
          // Find role in user_roles table (primary source)
          const userRole = userRoles?.find(ur => ur.user_id === profile.id);
          
          // Determine if this is a verified user (placeholder logic)
          // In a real scenario, this would check email verification status
          const isVerified = Boolean(profile.email && profile.full_name);
          
          return {
            id: profile.id,
            email: profile.email || 'No Email',
            full_name: profile.full_name || 'Unnamed User',
            role: (userRole?.role as UserRole) || profile.role as UserRole || 'user',
            created_at: profile.created_at,
            is_new: profile.created_at ? new Date(profile.created_at) > oneHourAgo : false,
            is_verified: isVerified
          };
        });
        
        // Sort with newest users first
        enhancedUsers.sort((a, b) => {
          if (!a.created_at) return 1;
          if (!b.created_at) return -1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        setUsers(enhancedUsers);
      }
      
      setDiagnosticInfo(prev => ({
        ...prev,
        lastRefreshed: new Date().toISOString()
      }));
      
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
    // Find the user and mark as loading
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.id === userId ? { ...u, loading: true } : u
      )
    );
    
    try {
      // First check if user has a role entry
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      let userRolesSuccess = false;
      
      // Update or insert into user_roles
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
      
      // Also update profiles table as fallback
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (profileError) {
        console.error("Error updating profile role:", profileError);
      }
      
      // If either update was successful, update UI
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
      
      // Reset loading state
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
      </div>
      
      {/* User filters */}
      <UserFilters 
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={resetFilters}
        onRefresh={fetchUsers}
        isLoading={loading}
        activeFilterCount={activeFilterCount}
      />
      
      {/* Diagnostic Info Panel */}
      <div className="bg-slate-50 p-4 rounded-md border border-slate-200 text-xs">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-medium">System Diagnostic</h3>
          <Badge variant={diagnosticInfo.fetchMethod === 'unknown' ? 'destructive' : 'success'}>
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
          ) : filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                {users.length > 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    <p>No users match your current filters</p>
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Clear all filters
                    </Button>
                  </div>
                ) : (
                  'No users found in the system'
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
                          <Badge variant="success" className="ml-2">New</Badge>
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
                    <Badge variant="verified">Verified</Badge>
                  ) : (
                    <Badge variant="pending">Unverified</Badge>
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
                          disabled={user.loading}
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
                        <Button variant="destructive" size="sm">
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
      
      {!loading && filteredUsers.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          Showing {filteredUsers.length} of {users.length} users
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
