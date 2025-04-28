
import { useState } from "react";
import { performFullTalentDataMigration } from "@/services/talentSyncService";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

  const runMigration = async () => {
    if (isMigrating) return;
    
    try {
      setIsMigrating(true);
      setMigrationResult(null);
      
      const result = await performFullTalentDataMigration();
      setMigrationResult(result);
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
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          Talent Data Migration Tool
        </CardTitle>
        <CardDescription>
          Transfer all talent registration data from emerge_submissions to talent_applications table
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <Alert variant="outline" className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-500" />
            <AlertTitle>Migration Information</AlertTitle>
            <AlertDescription className="text-sm">
              This tool will perform a one-time comprehensive migration of all talent registration data from 
              the emerge_submissions table to the talent_applications table. It will:
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
