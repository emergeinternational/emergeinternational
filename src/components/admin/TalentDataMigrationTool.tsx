import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { performFullTalentDataMigration } from "@/services/talentSyncService";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowRightLeft, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const TalentDataMigrationTool = () => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [migrationResults, setMigrationResults] = useState<{
    success: boolean;
    migratedCount: number;
    skippedCount: number;
    errorCount: number;
    errors: string[];
  } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const migrationMutation = useMutation({
    mutationFn: performFullTalentDataMigration,
    onSuccess: (data) => {
      setMigrationResults(data);
      setShowResults(true);
      
      if (data.errorCount > 0) {
        toast({
          variant: "destructive",
          title: "Migration completed with errors",
          description: `Migrated ${data.migratedCount} records, skipped ${data.skippedCount}, with ${data.errorCount} errors.`
        });
      } else {
        toast({
          title: "Migration completed successfully",
          description: `Migrated ${data.migratedCount} records, skipped ${data.skippedCount} duplicates.`
        });
      }
      
      // Refresh related queries
      queryClient.invalidateQueries({ queryKey: ['talent-applications'] });
      queryClient.invalidateQueries({ queryKey: ['talent-registration-counts'] });
      queryClient.invalidateQueries({ queryKey: ['talent-sync-status'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Migration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });
  
  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      await migrationMutation.mutateAsync();
    } finally {
      setIsMigrating(false);
    }
  };
  
  return (
    <div className="mt-6">
      <Collapsible 
        open={expanded} 
        onOpenChange={setExpanded}
        className="border border-gray-200 rounded-md"
      >
        <CollapsibleTrigger asChild>
          <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-gray-500" />
              <h3 className="font-medium">Data Migration Tool</h3>
            </div>
            {expanded ? 
              <ChevronUp className="h-5 w-5" /> : 
              <ChevronDown className="h-5 w-5" />
            }
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="p-4 pt-0 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Use this tool to migrate historical talent submissions from emerge_submissions to talent_applications.
              This process prevents duplicates and ensures data integrity.
            </p>
            
            <Button
              variant="default"
              onClick={handleMigration}
              disabled={isMigrating}
              className="mb-4"
            >
              {isMigrating ? "Migrating..." : "Start Full Migration"}
            </Button>
            
            {showResults && migrationResults && (
              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {migrationResults.success ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    Migration Results
                  </CardTitle>
                  <CardDescription>
                    {migrationResults.success 
                      ? "Migration completed successfully"
                      : "Migration completed with some issues"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {migrationResults.migratedCount}
                      </p>
                      <p className="text-sm text-gray-500">Records Migrated</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {migrationResults.skippedCount}
                      </p>
                      <p className="text-sm text-gray-500">Records Skipped</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {migrationResults.errorCount}
                      </p>
                      <p className="text-sm text-gray-500">Errors</p>
                    </div>
                  </div>
                  
                  {migrationResults.errors.length > 0 && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTitle>Migration Errors</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc pl-5 text-sm">
                          {migrationResults.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {migrationResults.errors.length > 5 && (
                            <li>...and {migrationResults.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="default"
                    size="sm"
                    onClick={() => setShowResults(false)}
                    className="ml-auto"
                  >
                    Dismiss
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
