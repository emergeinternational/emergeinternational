
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { syncTalentData, getTalentSyncLogs } from "@/services/talentSyncService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function TalentSyncDashboard() {
  const [showResult, setShowResult] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    processed?: number;
    inserted?: number;
    updated?: number;
    errors?: number;
    errorDetails?: string[];
  } | null>(null);
  
  const { toast } = useToast();
  
  // Fetch the most recent sync logs
  const { data: syncLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['talent-sync-logs'],
    queryFn: () => getTalentSyncLogs(5),
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  // Mutation to trigger the sync process
  const syncMutation = useMutation({
    mutationFn: syncTalentData,
    onSuccess: (data) => {
      setSyncResult(data);
      setShowResult(true);
      
      // Refetch the logs to show the latest sync
      refetchLogs();
      
      if (data.success) {
        toast({
          title: "Talent Sync Completed",
          description: `Processed ${data.processed} records: ${data.inserted} inserted, ${data.updated} updated`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Sync Completed With Errors",
          description: `${data.errors} errors occurred during synchronization`,
        });
      }
    },
    onError: (error) => {
      setShowResult(true);
      setSyncResult({
        success: false,
        errorDetails: [error instanceof Error ? error.message : "Unknown error occurred"]
      });
      
      toast({
        variant: "destructive",
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });

  const handleSync = async () => {
    setShowResult(false);
    syncMutation.mutate();
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Talent Synchronization</h2>
        <Button 
          onClick={handleSync} 
          disabled={syncMutation.isPending}
        >
          <RefreshCcw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
          {syncMutation.isPending ? "Syncing..." : "Sync Talent Data"}
        </Button>
      </div>
      
      <p className="text-sm text-gray-500">
        Synchronize talent data from external sources to your talent database.
      </p>
      
      {showResult && syncResult && (
        <Alert variant={syncResult.success ? "default" : "destructive"}>
          {syncResult.success ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {syncResult.success ? "Sync Completed Successfully" : "Sync Completed With Errors"}
          </AlertTitle>
          <AlertDescription>
            {syncResult.success 
              ? `Processed ${syncResult.processed} records: ${syncResult.inserted} inserted, ${syncResult.updated} updated`
              : `${syncResult.errors} errors occurred during synchronization`
            }
            
            {syncResult.errorDetails && syncResult.errorDetails.length > 0 && (
              <div className="mt-2 text-xs">
                <details>
                  <summary>View Error Details</summary>
                  <ul className="ml-4 mt-1">
                    {syncResult.errorDetails.map((error, index) => (
                      <li key={index} className="list-disc">{error}</li>
                    ))}
                  </ul>
                </details>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <Separator />
      
      <h3 className="text-lg font-medium">Recent Sync Activities</h3>
      
      {logsLoading ? (
        <div className="text-sm text-gray-500">Loading sync history...</div>
      ) : syncLogs && syncLogs.length > 0 ? (
        <div className="space-y-4">
          {syncLogs.map((log) => (
            <Card key={log.id} className="overflow-hidden">
              <CardHeader className="bg-muted py-3">
                <CardTitle className="text-sm font-medium flex justify-between">
                  <span>Sync Operation</span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.executed_at).toLocaleString()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-3">
                <div className="text-sm space-y-2">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Status:</span>
                    <span className={`${log.results?.success ? 'text-green-600' : 'text-red-600'}`}>
                      {log.results?.success ? 'Success' : 'Failed'}
                    </span>
                  </div>
                  
                  {log.results?.processed && (
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="font-medium">Processed</div>
                        <div className="text-lg">{log.results.processed}</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <div className="font-medium">Inserted</div>
                        <div className="text-lg">{log.results.inserted || 0}</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded">
                        <div className="font-medium">Updated</div>
                        <div className="text-lg">{log.results.updated || 0}</div>
                      </div>
                    </div>
                  )}
                  
                  {log.results?.error && (
                    <div className="text-red-600 text-xs">
                      {log.results.error}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500">No sync history available</div>
      )}
      
      <Card className="bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">About Talent Synchronization</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-500">
          <p>
            The talent synchronization process:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Fetches talent data from external sources</li>
            <li>Validates data integrity before insertion</li>
            <li>Maps external categories to standardized values</li>
            <li>Updates existing records or creates new ones</li>
            <li>Logs all synchronization activities</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
