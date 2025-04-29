
import { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import UserManagement from "../../components/admin/UserManagement";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PageLock from "@/components/admin/PageLock";

const userSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  role: z.enum(["admin", "editor", "viewer", "user"], {
    required_error: "Please select a role",
  }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type UserFormValues = z.infer<typeof userSchema>;

const UsersPage = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(true);
  const [systemStatus, setSystemStatus] = useState<{
    usersCount: number | null;
    adminEmail: string | null;
    lastRefresh: string;
    status: 'ready' | 'loading' | 'error';
    error?: string;
  }>({
    usersCount: null,
    adminEmail: null,
    lastRefresh: new Date().toISOString(),
    status: 'loading'
  });
  const { toast } = useToast();
  
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      fullName: "",
      role: "user",
      password: "",
    },
  });

  useEffect(() => {
    fetchSystemStatus();
    
    const channel = supabase
      .channel('user_system_monitor')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          console.log('Profile change detected in monitoring channel:', payload);
          fetchSystemStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const handleLockStatusChange = (status: boolean) => {
    setIsLocked(status);
  };

  const fetchSystemStatus = async () => {
    try {
      setSystemStatus(prev => ({ ...prev, status: 'loading' }));
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('role', 'admin');
        
      if (profilesError) {
        throw new Error(`Error fetching admin profile: ${profilesError.message}`);
      }
      
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (countError) {
        throw new Error(`Error counting profiles: ${countError.message}`);
      }
      
      setSystemStatus({
        usersCount: count,
        adminEmail: profilesData[0]?.email || 'reddshawn@yahoo.com',
        lastRefresh: new Date().toISOString(),
        status: 'ready'
      });
      
    } catch (error) {
      console.error("Error fetching system status:", error);
      setSystemStatus(prev => ({ 
        ...prev, 
        status: 'error',
        error: error instanceof Error ? error.message : "Unknown error fetching system status"
      }));
      
      toast({
        title: "Error checking system status",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleRefreshUserData = () => {
    setLastUpdated(new Date());
    fetchSystemStatus();
    
    toast({
      title: "User data refreshed",
      description: "The user list and system status have been refreshed."
    });
  };
  
  const handleAddUser = async (values: UserFormValues) => {
    if (isLocked) {
      toast({
        title: "Page is locked",
        description: "Unable to add users while the page is locked. Please unlock first.",
        variant: "destructive", // Changed from "warning"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        // Update the user's profile with additional information
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: values.fullName,
            role: values.role
          })
          .eq('id', authData.user.id);
          
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
        
        // Also add to user_roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: values.role
          });
          
        if (roleError) {
          console.error("Error setting user role:", roleError);
        }
        
        toast({
          title: "User created successfully",
          description: `${values.fullName} (${values.email}) has been added as a ${values.role}`,
          variant: "default"
        });
        
        form.reset();
        setOpenAddUserDialog(false);
        
        handleRefreshUserData();
      }
    } catch (error) {
      console.error("Error in handleAddUser:", error);
      toast({
        title: "Error creating user",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {isLocked && (
          <div className="bg-amber-50 p-4 mb-4 rounded-md border border-amber-200 flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="font-medium text-amber-700">Page is locked</h3>
              <p className="text-sm text-amber-600">This page is currently locked for safety. Unlock it to make changes to users.</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Users & Permissions</h1>
            <p className="text-sm text-gray-500">
              Manage user accounts and their permission levels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={handleRefreshUserData}
              className="flex items-center gap-2"
              disabled={systemStatus.status === 'loading'}
            >
              <RefreshCw className={`h-4 w-4 ${systemStatus.status === 'loading' ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                if (isLocked) {
                  toast({
                    title: "Page is locked",
                    description: "Unable to add users while the page is locked. Please unlock first.",
                    variant: "destructive", // Changed from "warning"
                  });
                } else {
                  setOpenAddUserDialog(true);
                }
              }}
              disabled={isLocked}
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
            <PageLock 
              pageId="usersPage" 
              onLockStatusChange={handleLockStatusChange}
              initialLockState={isLocked}
            />
          </div>
        </div>
        
        {systemStatus.status === 'ready' && (
          <div className="bg-white p-4 mb-6 rounded shadow border-l-4 border-emerge-gold">
            <h2 className="text-sm font-medium">System Status</h2>
            <div className="mt-2 text-sm grid grid-cols-3 gap-4">
              <div>
                <p className="text-gray-500">Admin Account</p>
                <p className="font-medium">{systemStatus.adminEmail || 'reddshawn@yahoo.com'}</p>
              </div>
              <div>
                <p className="text-gray-500">Total Users</p>
                <p className="font-medium">{systemStatus.usersCount !== null ? systemStatus.usersCount : 'Loading...'}</p>
              </div>
              <div>
                <p className="text-gray-500">Last System Check</p>
                <p className="font-medium">{new Date(systemStatus.lastRefresh).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        )}
        
        {systemStatus.status === 'error' && (
          <div className="bg-red-50 p-4 mb-6 rounded shadow border-l-4 border-red-500">
            <h2 className="text-sm font-medium text-red-800">System Error Detected</h2>
            <p className="text-sm text-red-700 mt-1">{systemStatus.error}</p>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleRefreshUserData} 
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}
        
        <div className="bg-white p-6 rounded shadow">
          <UserManagement isLocked={isLocked} key={lastUpdated?.getTime()} />
        </div>
      </div>
      
      <Dialog open={openAddUserDialog} onOpenChange={setOpenAddUserDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="user">Regular User</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="******" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpenAddUserDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UsersPage;
