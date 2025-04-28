
import AdminLayout from "../../layouts/AdminLayout";
import DesignersManager from "../../components/admin/designers/DesignersManager";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { usePageTitle } from "@/utils/usePageTitle";

const DesignersPage = () => {
  // Update the page title dynamically
  useEffect(() => {
    document.title = "Creative Professionals 🌍 | Emerge International";
  }, []);
  
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Creative Professionals</h1>
          <p className="text-sm text-gray-500">
            Manage creative professionals including designers, artists, photographers, and more
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
