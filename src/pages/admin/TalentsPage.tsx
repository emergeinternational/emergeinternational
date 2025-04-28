
import AdminLayout from "../../layouts/AdminLayout";
import { Toaster } from "@/components/ui/toaster";
import EmergingTalentList from "../../components/admin/EmergingTalentList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TalentManagement from "../../components/admin/talent/TalentManagement";

const TalentsPage = () => {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Talent Management</h1>
          <p className="text-sm text-gray-500">
            Review and process talent applications and submissions
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <Tabs defaultValue="applications">
            <TabsList className="mb-6">
              <TabsTrigger value="applications">Applications</TabsTrigger>
              <TabsTrigger value="submissions">Raw Submissions</TabsTrigger>
            </TabsList>
            <TabsContent value="applications">
              <TalentManagement />
            </TabsContent>
            <TabsContent value="submissions">
              <EmergingTalentList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default TalentsPage;
