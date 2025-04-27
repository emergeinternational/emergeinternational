
import React from 'react';
import AdminLayout from "@/layouts/AdminLayout";
import UserManagement from "@/components/admin/UserManagement";

const Users = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Users Management</h1>
        <UserManagement />
      </div>
    </AdminLayout>
  );
};

export default Users;
