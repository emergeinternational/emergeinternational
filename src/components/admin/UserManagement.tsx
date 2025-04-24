
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { 
  Check, 
  X, 
  UserCheck, 
  UserX, 
  Shield,
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

type UserRole = 'admin' | 'editor' | 'viewer' | 'user';

interface ExtendedUser extends User {
  role?: UserRole;
  profile?: {
    full_name: string | null;
  };
  loading?: boolean;
}

const UserManagement = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get all users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;
      
      // Get profiles for additional info
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name');
      
      if (profilesError) throw profilesError;
      
      // Map roles to users
      const enhancedUsers = authUsers.users.map(user => {
        const userRole = userRoles?.find(ur => ur.user_id === user.id);
        const profile = profiles?.find(p => p.id === user.id);
        
        return {
          ...user,
          role: (userRole?.role as UserRole) || 'user',
          profile: {
            full_name: profile?.full_name
          }
        };
      });
      
      setUsers(enhancedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error fetching users",
        description: error instanceof Error ? error.message : "An error occurred",
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
      // Check if role already exists
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existingRole) {
        // Update existing role
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: newRole });
        
        if (error) throw error;
      }
      
      // Update user in state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: newRole, loading: false } : u
        )
      );
      
      toast({
        title: "Role updated",
        description: `User role has been updated to ${newRole}`
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error updating role",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
      
      // Reset loading state
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, loading: false } : u
        )
      );
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
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
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                Loading users...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No users found
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">
                    {user.profile?.full_name || 'Unnamed User'}
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
