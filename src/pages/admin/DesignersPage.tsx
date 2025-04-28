
import AdminLayout from "../../layouts/AdminLayout";
import DesignersManager from "../../components/admin/designers/DesignersManager";
import { Toaster } from "@/components/ui/toaster";

const DesignersPage = () => {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Designers Management</h1>
          <p className="text-sm text-gray-500">
            Manage designer profiles and their associated products
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <DesignersManager />
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default DesignersPage;
