
import AdminLayout from "../../layouts/AdminLayout";
import TalentManagement from "../../components/admin/TalentManagement";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const TalentsPage = () => {
  // Debug function to check database schema
  const checkDatabaseSchema = async () => {
    try {
      console.log("Checking if talent_applications table exists...");
      
      // Check for records in the talent_applications table instead
      const { data: tableData, error: tableError } = await supabase
        .from('talent_applications')
        .select('id')
        .limit(1);
      
      if (tableError) {
        console.error("Error checking talent_applications table:", tableError);
      } else {
        console.log("talent_applications table exists, sample data:", tableData);
        
        // Make a direct fetch call to the edge function
        const { data, error } = await supabase.functions.invoke('select_columns_info', {
          body: { table_name: 'talent_applications' }
        });
        
        if (error) {
          console.error("Error calling select_columns_info function:", error);
        } else {
          console.log("Columns information:", data);
          
          // Check if gender column exists
          const hasGenderColumn = data?.columns?.some(col => col.column_name === 'gender');
          console.log("Gender column exists:", hasGenderColumn);
        }
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
