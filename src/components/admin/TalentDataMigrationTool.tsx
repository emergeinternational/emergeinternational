
import { useState } from "react";
import { performFullTalentDataMigration, getSyncLogs, getSyncStatusSummary } from "@/services/talentSyncService";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Database, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const TalentDataMigrationTool = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    migratedCount: number;
    skippedCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  // Query for sync status summary
  const { data: syncStatus, isLoading: loadingStatus, refetch: refetchStatus } = useQuery({
    queryKey: ['talent-sync-status'],
    queryFn: getSyncStatusSummary
  });

  // Query for recent sync logs
  const { data: syncLogs, isLoading: loadingLogs, refetch: refetchLogs } = useQuery({
    queryKey: ['talent-sync-logs'],
    queryFn: () => getSyncLogs(5)
  });

  const runMigration = async () => {
    if (isMigrating) return;
    
    try {
      setIsMigrating(true);
      setMigrationResult(null);
      
      const result = await performFullTalentDataMigration();
      setMigrationResult(result);
      
      // Refresh sync status data after migration
      refetchStatus();
      refetchLogs();
    } catch (error) {
      console.error("Error during migration:", error);
      setMigrationResult({
        success: false,
        migratedCount: 0,
        skippedCount: 0,
        errorCount: 1,
        errors: [error instanceof Error ? error.message : "Unknown error"]
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" />
              Talent Data Management
            </CardTitle>
            <CardDescription>
              Tools for managing talent registration data synchronization
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Auto-Sync Enabled
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="migration">
          <TabsList className="mb-4">
            <TabsTrigger value="migration">Data Migration</TabsTrigger>
            <TabsTrigger value="status">Sync Status</TabsTrigger>
            <TabsTrigger value="logs">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="migration">
            <div className="space-y-4">
              <Alert variant="outline" className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle>Migration Information</AlertTitle>
                <AlertDescription className="text-sm">
                  <p className="mb-2">
                    This tool will perform a one-time comprehensive migration of all talent registration data from 
                    the emerge_submissions table to the talent_applications table.
                  </p>
                  <p className="font-medium">Note: Future submissions are automatically synced via database trigger.</p>
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Skip any records that already exist in talent_applications (based on email or phone)</li>
                    <li>Preserve all data integrity - no existing records will be overwritten</li>
                    <li>Properly map all fields between the two tables</li>
                    <li>Report detailed results after completion</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {migrationResult && (
                <div className="space-y-3">
                  <Alert 
                    variant={migrationResult.success ? "default" : "destructive"}
                    className={migrationResult.success ? "bg-green-50 border-green-200" : ""}
                  >
                    {migrationResult.success ? 
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                      <AlertCircle className="h-4 w-4" />
                    }
                    <AlertTitle>
                      {migrationResult.success ? "Migration Complete" : "Migration Completed with Errors"}
                    </AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 space-y-1">
                        <p><strong>Records migrated:</strong> {migrationResult.migratedCount}</p>
                        <p><strong>Records skipped (duplicates):</strong> {migrationResult.skippedCount}</p>
                        <p><strong>Errors encountered:</strong> {migrationResult.errorCount}</p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {migrationResult.errorCount > 0 && (
                    <div className="mt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowErrors(!showErrors)}
                      >
                        {showErrors ? "Hide Error Details" : "Show Error Details"}
                      </Button>
                      
                      {showErrors && (
                        <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3 bg-gray-50">
                          <p className="font-semibold mb-2">Error Details:</p>
                          <ul className="space-y-1 text-sm">
                            {migrationResult.errors.map((error, index) => (
                              <li key={index} className="text-red-600">{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="status">
            <div className="space-y-4">
              <Alert variant="default" className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle>Real-Time Sync Status</AlertTitle>
                <AlertDescription className="text-sm">
                  All new registrations are automatically synchronized to the talent management system via a database trigger.
                </AlertDescription>
              </Alert>
              
              {loadingStatus ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : syncStatus ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium mb-2">Sync Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Total Submissions:</span>
                        <span className="font-medium">{syncStatus.totalSubmissions}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Synced Records:</span>
                        <span className="font-medium text-green-600">{syncStatus.syncedCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Pending Records:</span>
                        <span className="font-medium text-amber-600">{syncStatus.pendingCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Sync Percentage:</span>
                        <span className="font-medium">{syncStatus.syncPercentage}%</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-green-500 h-2.5 rounded-full" 
                        style={{ width: `${syncStatus.syncPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border shadow-sm">
                    <h3 className="text-lg font-medium mb-2">Sync System</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Auto-sync trigger is active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Sync logs are being recorded</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Sync status monitoring is enabled</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>Duplicate detection is functioning</span>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => refetchStatus()}
                    >
                      Refresh Status
                    </Button>
                  </div>
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error loading sync status</AlertTitle>
                  <AlertDescription>
                    {syncStatus?.error || "Failed to load synchronization status information."}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="logs">
            <div className="space-y-4">
              <Alert variant="outline" className="bg-blue-50 border-blue-200">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle>Recent Synchronization Activity</AlertTitle>
                <AlertDescription className="text-sm">
                  This shows the latest automatic synchronization events between registration forms and the talent management system.
                </AlertDescription>
              </Alert>
              
              {loadingLogs ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
              ) : syncLogs && syncLogs.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {syncLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(log.executed_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {log.results?.email || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {log.results?.success ? (
                              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                Synced
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-50">
                                {log.results?.reason?.includes("Duplicate") ? "Duplicate" : "Failed"}
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-md">
                  <p className="text-gray-500">No synchronization logs available yet</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchLogs()}
                  disabled={loadingLogs}
                >
                  {loadingLogs && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Refresh Logs
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={runMigration} 
          disabled={isMigrating}
          className="w-full"
        >
          {isMigrating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isMigrating ? "Running Migration..." : "Start One-Time Migration"}
        </Button>
      </CardFooter>
    </Card>
  );
};
