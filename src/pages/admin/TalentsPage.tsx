
import AdminLayout from "../../layouts/AdminLayout";
import TalentManagement from "../../components/admin/TalentManagement";
import { Toaster } from "@/components/ui/toaster";

const TalentsPage = () => {
  // Debug log to verify page mount
  console.log("Admin TalentsPage mounted");

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Talent Applications</h1>
          <p className="text-sm text-gray-500">
            Manage and review talent registration applications
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <TalentManagement />
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default TalentsPage;
