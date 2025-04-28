
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { forceSyncTalentData } from "@/services/talentSyncService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function TalentSyncActions() {
  const [showResult, setShowResult] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    syncedCount?: number;
    message?: string;
    error?: string;
  } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const syncMutation = useMutation({
    mutationFn: forceSyncTalentData,
    onSuccess: (data) => {
      setSyncResult(data);
      setShowResult(true);
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['talent-applications'] });
      queryClient.invalidateQueries({ queryKey: ['talent-registration-counts'] });
      queryClient.invalidateQueries({ queryKey: ['talent-sync-status'] });
      
      if (data.success) {
        toast({
          title: "Forced synchronization complete",
          description: data.message || `Successfully synced ${data.syncedCount} records.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Synchronization error",
          description: data.error || "An unknown error occurred during synchronization",
        });
      }
    },
    onError: (error) => {
      setShowResult(true);
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
      
      toast({
        variant: "destructive",
        title: "Force sync failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });

  const handleForceSync = async () => {
    setShowResult(false);
    syncMutation.mutate();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Talent Data Synchronization</h3>
          <Button 
            onClick={handleForceSync} 
            disabled={syncMutation.isPending}
            size="sm"
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? "animate-spin" : ""}`} />
            {syncMutation.isPending ? "Syncing..." : "Force Sync Now"}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Force an immediate synchronization of all talent submissions to ensure data consistency between systems.
        </p>
      </div>
      
      <Separator />
      
      {showResult && syncResult && (
        <Alert variant={syncResult.success ? "default" : "destructive"}>
          {syncResult.success ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {syncResult.success ? "Sync Completed" : "Sync Error"}
          </AlertTitle>
          <AlertDescription>
            {syncResult.message || 
             (syncResult.success 
              ? `Successfully synced ${syncResult.syncedCount} records.` 
              : "Failed to sync talent data.")}
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">About Force Sync</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-500">
          <p>
            The force sync operation:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Processes all submissions regardless of their current sync status</li>
            <li>Runs with elevated database permissions via Edge Functions</li>
            <li>Updates sync status flags on all processed records</li>
            <li>Automatically skips duplicates to maintain data integrity</li>
          </ul>
        </CardContent>
        <CardFooter className="pt-0 text-xs text-gray-400">
          Run this operation only when necessary to resolve sync issues.
        </CardFooter>
      </Card>
    </div>
  );
}
