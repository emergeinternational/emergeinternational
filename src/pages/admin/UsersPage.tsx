
import AdminLayout from "../../layouts/AdminLayout";
import UserManagement from "../../components/admin/UserManagement";

const UsersPage = () => {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Users & Permissions</h1>
          <p className="text-sm text-gray-500">
            Manage user accounts and their permission levels
          </p>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
          <UserManagement />
        </div>
      </div>
    </AdminLayout>
  );
};

export default UsersPage;
