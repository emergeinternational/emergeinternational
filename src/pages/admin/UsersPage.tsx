
import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import UserManagement from "../../components/admin/UserManagement";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const UsersPage = () => {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  // Function to refresh the user management component
  const handleRefreshUserData = () => {
    setLastUpdated(new Date());
    
    toast({
      title: "User data refreshed",
      description: "The user list has been refreshed."
    });
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
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <UserManagement key={lastUpdated?.getTime()} />
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
