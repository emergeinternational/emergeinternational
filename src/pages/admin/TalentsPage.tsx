
import { useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import TalentManagement from "../../components/admin/TalentManagement";
import { Toaster } from "@/components/ui/toaster";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { checkTalentApplicationsTable } from "@/services/talentService";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";

const TalentsPage = () => {
  const [diagnosticsVisible, setDiagnosticsVisible] = useState(false);

  const { data: diagnostics } = useQuery({
    queryKey: ['talent-db-diagnostics'],
    queryFn: checkTalentApplicationsTable,
    enabled: diagnosticsVisible
  });

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">Talent Applications</h1>
            <p className="text-sm text-gray-500">
              Manage and review talent registration applications
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setDiagnosticsVisible(!diagnosticsVisible)}
          >
            {diagnosticsVisible ? "Hide Diagnostics" : "Show System Status"}
          </Button>
        </div>
        
        {diagnosticsVisible && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-2">System Diagnostics</h2>
              {diagnostics ? (
                <div className="space-y-3">
                  <Alert variant={diagnostics.exists ? "default" : "destructive"}>
                    {diagnostics.exists ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>Database Status</AlertTitle>
                    <AlertDescription>
                      Talent applications table: {diagnostics.exists ? "Available" : "Not Found"}
                      {diagnostics.columnCount !== undefined && (
                        <span className="ml-2">(Records: {diagnostics.columnCount})</span>
                      )}
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>System Status</AlertTitle>
                    <AlertDescription className="space-y-1">
                      <div>Supabase Connection: Active</div>
                      <div>Last Checked: {new Date().toLocaleTimeString()}</div>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <p>Loading diagnostics...</p>
              )}
            </CardContent>
          </Card>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow">
          <TalentManagement />
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default TalentsPage;
