
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import TalentSyncSection from "./TalentSyncSection";
import TalentApplicationsTable from "./TalentApplicationsTable";

interface TalentManagementProps {
  isLocked?: boolean;
}

const TalentManagement = ({ isLocked = false }: TalentManagementProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['talent-applications'],
    queryFn: async () => {
      console.log("Fetching talent applications...");
      const { data, error } = await supabase
        .from('talent_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching applications:", error);
        throw error;
      }
      
      console.log("Fetched applications:", data);
      return data || [];
    }
  });

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast({
        title: "Data refreshed",
        description: "The talent applications list has been updated"
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Refresh failed",
        description: "There was an error updating the applications list",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const refetchApplications = async () => {
    await refetch();
  };

  return (
    <div className="space-y-6">
      {!isLocked && <TalentSyncSection refetchApplications={refetchApplications} />}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Applications</h2>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing || isLoading ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      <TalentApplicationsTable 
        applications={applications}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        isLocked={isLocked}
      />
    </div>
  );
};

export default TalentManagement;
