
import React, { useState } from "react";
import AdminLayout from "@/layouts/AdminLayout";
import UserManagement from "@/components/admin/UserManagement";
import RoleGuide from "@/components/admin/RoleGuide";
import UserFilters from "@/components/admin/UserFilters";

const Users = () => {
  // Mock user data - would come from API in real app
  const [users] = useState([
    {
      id: "1",
      email: "admin@example.com",
      created_at: "2024-01-15",
      last_sign_in_at: "2024-04-01",
      role: "admin",
      account_status: "active" as const
    },
    {
      id: "2",
      email: "editor@example.com",
      created_at: "2024-02-20",
      last_sign_in_at: "2024-03-25",
      role: "editor",
      account_status: "active" as const
    },
    {
      id: "3",
      email: "viewer@example.com",
      created_at: "2024-03-05",
      last_sign_in_at: "2024-03-30",
      role: "viewer",
      account_status: "active" as const
    },
    {
      id: "4",
      email: "user@example.com",
      created_at: "2024-03-10",
      last_sign_in_at: null,
      role: "user",
      account_status: "suspended" as const
    },
  ]);

  const handleRoleChange = (userId: string, role: string) => {
    console.log(`Change role of user ${userId} to ${role}`);
  };

  const handleStatusChange = (userId: string, status: 'active' | 'suspended' | 'deleted') => {
    console.log(`Change status of user ${userId} to ${status}`);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <UserFilters 
              onFilterChange={(filters) => console.log('Filter changed:', filters)} 
            />
            
            <UserManagement 
              users={users}
              onRoleChange={handleRoleChange}
              onStatusChange={handleStatusChange}
            />
          </div>
          
          <div className="space-y-6">
            <RoleGuide />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Users;
