
import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import UserManagement from "../../components/admin/UserManagement";
import { Button } from "@/components/ui/button";
import { UserPlus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SystemStatus from "@/components/admin/users/SystemStatus";
import AddUserDialog from "@/components/admin/users/AddUserDialog";
import { useUserSystemStatus } from "@/hooks/useUserSystemStatus";

const UsersPage = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { systemStatus, fetchSystemStatus } = useUserSystemStatus();
  const { toast } = useToast();

  // Function to refresh the user management component and system status
  const handleRefreshUserData = () => {
    setLastUpdated(new Date());
    fetchSystemStatus();
    
    toast({
      title: "User data refreshed",
      description: "The user list and system status have been refreshed."
    });
  };
  
  // Function to handle adding a new user
  const handleAddUser = async (values: {
    email: string;
    fullName: string;
    role: 'admin' | 'editor' | 'viewer' | 'user';
    password: string;
  }) => {
    try {
      setIsSubmitting(true);
      
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true,
      });
      
      if (authError) throw authError;
      
      if (authData?.user) {
        // Update the profile with full name
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: values.fullName,
            email: values.email
          })
          .eq('id', authData.user.id);
          
        if (profileError) {
          console.error("Error updating profile:", profileError);
        }
        
        // Set the user role
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
              onClick={() => setOpenAddUserDialog(true)}
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
        
        <SystemStatus 
          status={systemStatus}
          onRefresh={fetchSystemStatus}
        />
        
        <div className="bg-white p-6 rounded shadow">
          <UserManagement key={lastUpdated?.getTime()} />
        </div>
      </div>
      
      <AddUserDialog
        open={openAddUserDialog}
        onOpenChange={setOpenAddUserDialog}
        onSubmit={handleAddUser}
        isSubmitting={isSubmitting}
      />
    </AdminLayout>
  );
};

export default UsersPage;
