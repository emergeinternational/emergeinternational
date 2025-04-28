
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, AlertCircle, Check, Lock, Unlock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTalentSync } from "@/hooks/useTalentSync";
import { usePageProtection } from "@/hooks/usePageProtection";
import { Badge } from "@/components/ui/badge";

export function TalentSyncActions() {
  const [showResult, setShowResult] = useState(false);
  const { toast } = useToast();
  const { isLocked, requestUnlock, lockPage } = usePageProtection("Talent Management");
  
  const { 
    runForceSync, 
    isForceSyncing, 
    forceSyncResult, 
    forceSyncError 
  } = useTalentSync();

  const handleForceSync = async () => {
    // Check if action is allowed while page is protected
    if (!requestUnlock()) {
      return;
    }
    
    setShowResult(false);
    try {
      const result = await runForceSync();
      setShowResult(true);
      
      if (result.success) {
        toast({
          title: "Forced synchronization complete",
          description: result.message || `Successfully synced ${result.syncedCount} records.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Synchronization error",
          description: result.error || "An unknown error occurred during synchronization",
        });
      }
    } catch (error) {
      setShowResult(true);
      toast({
        variant: "destructive",
        title: "Force sync failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-medium">Talent Data Synchronization</h3>
            {isLocked ? (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <Lock className="h-3 w-3 mr-1" /> Protected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Unlock className="h-3 w-3 mr-1" /> Unlocked
              </Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {!isLocked && (
              <Button 
                onClick={lockPage} 
                size="sm"
                variant="outline"
              >
                <Lock className="h-4 w-4 mr-2" />
                Lock Page
              </Button>
            )}
            <Button 
              onClick={handleForceSync} 
              disabled={isForceSyncing}
              size="sm"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isForceSyncing ? "animate-spin" : ""}`} />
              {isForceSyncing ? "Syncing..." : "Force Sync Now"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Force an immediate synchronization of all talent submissions to ensure data consistency between systems.
        </p>
      </div>
      
      <Separator />
      
      {showResult && forceSyncResult && (
        <Alert variant={forceSyncResult.success ? "default" : "destructive"}>
          {forceSyncResult.success ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {forceSyncResult.success ? "Sync Completed" : "Sync Error"}
          </AlertTitle>
          <AlertDescription>
            {forceSyncResult.message || 
             (forceSyncResult.success 
              ? `Successfully synced ${forceSyncResult.syncedCount} records.` 
              : "Failed to sync talent data.")}
          </AlertDescription>
        </Alert>
      )}
      
      {showResult && forceSyncError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sync Failed</AlertTitle>
          <AlertDescription>
            {forceSyncError instanceof Error 
              ? forceSyncError.message 
              : "An unknown error occurred during synchronization"}
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
