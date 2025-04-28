
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { forceMigrateTalentData } from "@/services/talentMigrationService";
import { getMigrationStats } from "@/services/talentCoreService";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCcw, AlertCircle, Check, ArrowRightLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export function TalentMigrationTool() {
  const [showResult, setShowResult] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean;
    migratedCount?: number;
    message?: string;
    error?: string;
  } | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: migrationStats, isLoading: statsLoading } = useQuery({
    queryKey: ['talent-migration-stats'],
    queryFn: getMigrationStats,
    refetchInterval: 30000 // Refresh every 30 seconds
  });
  
  const migrationMutation = useMutation({
    mutationFn: forceMigrateTalentData,
    onSuccess: (data) => {
      setMigrationResult(data);
      setShowResult(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['talent-migration-stats'] });
      
      if (data.success) {
        toast({
          title: "Migration complete",
          description: data.message || `Successfully migrated ${data.migratedCount} talents.`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Migration error",
          description: data.error || "An unknown error occurred during migration",
        });
      }
    },
    onError: (error) => {
      setShowResult(true);
      setMigrationResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      });
      
      toast({
        variant: "destructive",
        title: "Migration failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  });

  const handleMigration = async () => {
    setShowResult(false);
    migrationMutation.mutate();
  };

  return (
    <div className="space-y-4 mt-6 pt-6 border-t border-gray-200">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Talent Migration Tool</h3>
          <Button 
            onClick={handleMigration} 
            disabled={migrationMutation.isPending}
            size="sm"
          >
            <ArrowRightLeft className={`h-4 w-4 mr-2 ${migrationMutation.isPending ? "animate-spin" : ""}`} />
            {migrationMutation.isPending ? "Migrating..." : "Migrate Approved Talents"}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Migrate approved talent applications to the new talent database structure with categories and levels.
        </p>
        
        {!statsLoading && migrationStats && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Migration Progress</span>
              <span>{migrationStats.migrationPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={migrationStats.migrationPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{migrationStats.migratedCount} migrated</span>
              <span>{migrationStats.pendingCount} pending</span>
            </div>
          </div>
        )}
      </div>
      
      <Separator />
      
      {showResult && migrationResult && (
        <Alert variant={migrationResult.success ? "default" : "destructive"}>
          {migrationResult.success ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {migrationResult.success ? "Migration Completed" : "Migration Error"}
          </AlertTitle>
          <AlertDescription>
            {migrationResult.message || 
             (migrationResult.success 
              ? `Successfully migrated ${migrationResult.migratedCount} records.` 
              : "Failed to migrate talent data.")}
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="bg-gray-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">About Talent Migration</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-gray-500">
          <p>
            The migration process:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Transfers approved talent applications to the new structured talent table</li>
            <li>Maps free-form categories to standardized enum values</li>
            <li>Sets initial talent level to beginner</li>
            <li>Preserves all profile data and social media links</li>
            <li>Skips existing records to maintain data integrity</li>
          </ul>
        </CardContent>
        <CardFooter className="pt-0 text-xs text-gray-400">
          New talents will be created with proper categorization and experience levels.
        </CardFooter>
      </Card>
    </div>
  );
}
