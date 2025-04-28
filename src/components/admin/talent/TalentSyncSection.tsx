
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

interface TalentSyncSectionProps {
  refetchApplications: () => Promise<void>;
}

const TalentSyncSection = ({ refetchApplications }: TalentSyncSectionProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<any>(null);
  const { toast } = useToast();

  const { data: pendingSubmissions, isLoading: isLoadingSubmissions } = useQuery({
    queryKey: ['pending-emerge-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('emerge_submissions')
        .select('*')
        .eq('sync_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching pending submissions:", error);
        throw error;
      }
      
      return data || [];
    }
  });

  const syncTalentsMutation = useMutation({
    mutationFn: async () => {
      setIsSyncing(true);
      const { data, error } = await supabase.functions.invoke('talent-sync');
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSyncResults(data);
      toast({
        title: "Sync completed",
        description: `Successfully processed ${data.processed} talent submissions`
      });
      // Refresh applications list
      refetchApplications();
    },
    onError: (error) => {
      console.error("Error syncing talents:", error);
      toast({
        title: "Sync failed",
        description: "There was an error syncing talent applications",
        variant: "destructive"
      });
    },
    onSettled: () => {
      setIsSyncing(false);
    }
  });

  const handleSyncTalents = () => {
    syncTalentsMutation.mutate();
  };

  if (!pendingSubmissions || pendingSubmissions.length === 0) {
    return null;
  }

  return (
    <>
      <Alert className="bg-amber-50 border-amber-200 mb-6">
        <AlertDescription className="flex items-center justify-between">
          <span>
            There are <strong>{pendingSubmissions.length}</strong> new talent submissions that need to be synced
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncTalents}
            disabled={isSyncing}
            className="border-amber-500 hover:bg-amber-100"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Now"}
          </Button>
        </AlertDescription>
      </Alert>

      {syncResults && (
        <div className="p-4 bg-gray-50 rounded-lg mb-4">
          <h3 className="font-medium mb-2">Last Sync Results</h3>
          <p>Processed: {syncResults.processed} submissions</p>
          <div className="mt-2 text-sm">
            {syncResults.results && syncResults.results.map((result: any, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                <span className={result.status === 'synced' ? 'text-green-500' : 'text-blue-500'}>
                  {result.email}
                </span>
                <span className="text-gray-500">-</span>
                <span className="capitalize">{result.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default TalentSyncSection;
