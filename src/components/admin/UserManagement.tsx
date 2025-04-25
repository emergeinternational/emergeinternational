
import { useState, useEffect } from "react";
import { 
  Check, 
  X, 
  UserCheck, 
  UserX, 
  Shield,
  RefreshCw,
  Filter
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
  DropdownMenuItem,
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

type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  loading?: boolean;
  created_at?: string;
  last_sign_in_at?: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllUsers, setShowAllUsers] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // First fetch all auth users directly using the auth API
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        // If we can't access auth.admin API, fallback to profiles table
        fallbackToProfilesTable();
        return;
      }
      
      if (authUsers) {
        console.log(`Fetched ${authUsers.users.length} users from auth API`);
        
        // Get user roles
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role');
        
        if (rolesError) {
          console.error('Error fetching user roles:', rolesError);
        }
        
        // Get profiles for additional user data
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, role');
          
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }
        
        // Map users with roles and profile data
        const enhancedUsers: UserWithRole[] = authUsers.users.map(user => {
          // Find role in user_roles table (primary source)
          const userRole = userRoles?.find(ur => ur.user_id === user.id);
          
          // Find profile data
          const profile = profiles?.find(p => p.id === user.id);
          
          return {
            id: user.id,
            email: user.email || 'No Email',
            full_name: profile?.full_name || user.user_metadata?.full_name || 'Unnamed User',
            role: (userRole?.role as UserRole) || profile?.role as UserRole || 'user',
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at
          };
        });
        
        setUsers(enhancedUsers);
      }
    } catch (error) {
      console.error('Error in primary user fetch method:', error);
      // Fallback to profiles table if auth API fails
      fallbackToProfilesTable();
    } finally {
      setLoading(false);
    }
  };
  
  const fallbackToProfilesTable = async () => {
    try {
      console.log('Falling back to profiles table for user data');
      // Instead of using the admin API, we'll fetch from profiles and user_roles tables
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at');
      
      if (profilesError) throw profilesError;
      
      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;
      
      // Map roles to profiles
      const enhancedUsers: UserWithRole[] = profiles.map(profile => {
        const userRole = userRoles?.find(ur => ur.user_id === profile.id);
        
        return {
          id: profile.id,
          email: profile.email || 'No Email',
          full_name: profile.full_name,
          role: (userRole?.role as UserRole) || 'user',
          created_at: profile.created_at
        };
      });
      
      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error in fallback user fetch:', error);
      toast({
        title: "Error fetching users",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      setUsers([]);
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
      // Use a stored procedure approach via a serverless function or RPC
      // For now, we'll use a simple approach by updating both tables individually
      
      // 1. Update profiles table first (this should have less restrictive RLS)
      const { error: profilesError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (profilesError) {
        console.error("Error updating profile role:", profilesError);
        // Don't throw yet, try updating user_roles
      }
      
      // 2. Check if entry exists in user_roles
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
        
      let userRolesSuccess = false;
      
      // 3. Either update or insert into user_roles
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
      
      // 4. If either update was successful, update UI
      if (!profilesError || userRolesSuccess) {
        // Update local state
        setUsers(prevUsers => 
          prevUsers.map(u => 
            u.id === userId ? { ...u, role: newRole, loading: false } : u
          )
        );
        
        toast({
          title: "Role updated successfully",
          description: `User role has been updated to ${newRole}`,
          duration: 3000
        });
      } else {
        // Both updates failed
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
      
      // Show error toast
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
        duration: 5000
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
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
              >
                <Filter className="h-4 w-4 mr-1" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowAllUsers(!showAllUsers)}>
                {showAllUsers ? 
                  <Check className="h-4 w-4 mr-2" /> : 
                  <div className="w-4 h-4 mr-2" />
                }
                Show all users
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={fetchUsers}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
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
                  <div className="font-medium">
                    {user.full_name || 'Unnamed User'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user.id.slice(0, 8)}...
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className={`flex items-center font-medium ${getRoleColor(user.role || 'user')}`}>
                    {getRoleIcon(user.role || 'user')}
                    {user.role || 'user'}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div>{formatDate(user.created_at)}</div>
                  {user.last_sign_in_at && (
                    <div className="text-xs text-gray-500">
                      Last sign in: {formatDate(user.last_sign_in_at)}
                    </div>
                  )}
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
      
      {!loading && users.length > 0 && (
        <div className="text-xs text-gray-500 mt-2">
          Showing {users.length} users
        </div>
      )}
    </div>
  );
};

export default UserManagement;
