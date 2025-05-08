
import AdminLayout from "../../layouts/AdminLayout";
import DonationsManager from "../../components/admin/donations/DonationsManager";
import { Toaster } from "@/components/ui/toaster";

const DonationsManagementPage = () => {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Donations Management</h1>
          <p className="text-sm text-gray-500">
            Track donations, manage donors, and issue certificates
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <DonationsManager />
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default DonationsManagementPage;
