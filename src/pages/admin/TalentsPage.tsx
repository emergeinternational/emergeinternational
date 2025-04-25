
import AdminLayout from "../../layouts/AdminLayout";
import TalentManagement from "../../components/admin/TalentManagement";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const TalentsPage = () => {
  // Debug function to check database schema
  const checkDatabaseSchema = async () => {
    try {
      // Check if gender column exists in talent_applications table
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'talent_applications')
        .eq('table_schema', 'public');
      
      if (error) {
        console.error("Error checking schema:", error);
      } else {
        console.log("Available columns in talent_applications:", data);
        
        // Check if gender column exists
        const hasGenderColumn = data?.some(col => col.column_name === 'gender');
        console.log("Gender column exists:", hasGenderColumn);
      }
    } catch (err) {
      console.error("Error checking database schema:", err);
    }
  };

  useEffect(() => {
    console.log("Admin TalentsPage mounted");
    // Check database schema when page loads
    checkDatabaseSchema();
  }, []);

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
