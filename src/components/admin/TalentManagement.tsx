import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, MapPin, Instagram, ArrowDownUp, CheckCircle } from "lucide-react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchTalentApplications, updateApplicationStatus } from "@/services/talentService";
import { syncEmergeSubmissions, getTalentRegistrationCounts, getSyncStatusSummary } from "@/services/talentSyncService";
import { TalentApplication, TalentStatus } from "@/types/talentTypes";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TalentDataMigrationTool } from "./TalentDataMigrationTool";
import { Badge } from "@/components/ui/badge";

const TalentManagement = () => {
  const [selectedApplication, setSelectedApplication] = useState<TalentApplication | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['talent-applications'],
    queryFn: fetchTalentApplications,
    meta: {
      onError: (error: Error) => {
        console.error("Error in talent applications query:", error);
        toast({
          title: "Failed to load applications",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
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

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TalentStatus }) => 
      updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talent-applications'] });
      toast({
        title: "Status updated",
        description: "Application status has been updated"
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating status",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  const syncMutation = useMutation({
    mutationFn: syncEmergeSubmissions,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['talent-applications'] });
      queryClient.invalidateQueries({ queryKey: ['talent-registration-counts'] });
      
      if (data.success) {
        toast({
          title: "Sync completed",
          description: `${data.transferredCount} new registrations imported successfully.`
        });
      } else {
        toast({
          title: "Sync partially completed",
          description: data.errorMessage || "Unknown error occurred during sync",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });

  const handleSyncRegistrations = async () => {
    try {
      setIsSyncing(true);
      await syncMutation.mutateAsync();
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = (status: TalentStatus) => {
    switch (status) {
      case 'approved':
        return 'text-green-600';
      case 'rejected':
        return 'text-red-600';
      case 'on_hold':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  const filteredApplications = applications?.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Applications</h2>
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSyncRegistrations}
            disabled={isLoading || isRefreshing || isSyncing}
          >
            <ArrowDownUp className={`h-4 w-4 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Syncing..." : "Sync Registrations"}
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing || isSyncing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing || isLoading ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="on_hold">On Hold</TabsTrigger>
          </TabsList>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Social Media</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading || isRefreshing ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading applications...
                  </TableCell>
                </TableRow>
              ) : applications && applications.length > 0 && filteredApplications && filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        {app.photo_url ? (
                          <AvatarImage src={app.photo_url} alt={app.full_name} />
                        ) : (
                          <AvatarFallback>{app.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{app.full_name}</div>
                      <div className="text-sm text-gray-500">
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          {app.age && <span className="mr-2">{app.age} years old</span>}
                          {app.gender && <span className="mr-2">({app.gender})</span>}
                          {app.country && (
                            <span className="flex items-center text-gray-600">
                              <MapPin className="h-3 w-3 mr-1" />
                              {app.country}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{app.email}</div>
                        {app.phone && (
                          <div className="text-sm text-gray-500">{app.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {app.category_type ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerge-cream text-emerge-darkBg">
                          {app.category_type}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>
                      {app.social_media && (
                        <div className="space-y-1">
                          {app.social_media.instagram && (
                            <a
                              href={`https://instagram.com/${app.social_media.instagram.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-emerge-gold hover:underline"
                            >
                              <Instagram className="h-4 w-4 mr-1" />
                              {app.social_media.instagram}
                            </a>
                          )}
                          {app.social_media.tiktok && (
                            <span className="text-sm text-gray-600">
                              TikTok: {app.social_media.tiktok}
                            </span>
                          )}
                          {app.social_media.telegram && (
                            <span className="text-sm text-gray-600">
                              Telegram: {app.social_media.telegram}
                            </span>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getStatusColor(app.status)}`}>
                        {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedApplication(app)}
                            >
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Application Details</DialogTitle>
                              <DialogDescription>
                                Review the complete application information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedApplication && (
                              <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                  <Avatar className="h-20 w-20">
                                    {selectedApplication.photo_url ? (
                                      <AvatarImage src={selectedApplication.photo_url} alt={selectedApplication.full_name} />
                                    ) : (
                                      <AvatarFallback>{selectedApplication.full_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    )}
                                  </Avatar>
                                  <div>
                                    <h3 className="text-lg font-semibold">{selectedApplication.full_name}</h3>
                                    <p className="text-sm text-gray-500">
                                      {selectedApplication.category_type || 'Category not specified'}
                                      {selectedApplication.gender && ` (${selectedApplication.gender})`}
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-semibold">Personal Information</h3>
                                    <div className="space-y-2 mt-2">
                                      <p>Age: {selectedApplication.age || 'Not specified'}</p>
                                      <p>Gender: {selectedApplication.gender || 'Not specified'}</p>
                                      <p>Country: {selectedApplication.country || 'Not specified'}</p>
                                      <p>Email: {selectedApplication.email}</p>
                                      {selectedApplication.phone && (
                                        <p>Phone: {selectedApplication.phone}</p>
                                      )}
                                      {selectedApplication.social_media && (
                                        <div className="space-y-1">
                                          <h4 className="text-sm font-medium">Social Media</h4>
                                          {selectedApplication.social_media.instagram && (
                                            <a
                                              href={`https://instagram.com/${selectedApplication.social_media.instagram.replace('@', '')}`}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center text-emerge-gold hover:underline"
                                            >
                                              <Instagram className="h-4 w-4 mr-1" />
                                              {selectedApplication.social_media.instagram}
                                            </a>
                                          )}
                                          {selectedApplication.social_media.tiktok && (
                                            <p className="text-sm">
                                              TikTok: {selectedApplication.social_media.tiktok}
                                            </p>
                                          )}
                                          {selectedApplication.social_media.telegram && (
                                            <p className="text-sm">
                                              Telegram: {selectedApplication.social_media.telegram}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div>
                                    <h3 className="font-semibold">Professional Details</h3>
                                    <div className="space-y-2 mt-2">
                                      <p>Experience: {selectedApplication.experience_years || 'N/A'} years</p>
                                      {selectedApplication.portfolio_url && (
                                        <p>
                                          <a 
                                            href={selectedApplication.portfolio_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-emerge-gold hover:underline inline-flex items-center"
                                          >
                                            Portfolio <ExternalLink className="h-4 w-4 ml-1" />
                                          </a>
                                        </p>
                                      )}
                                    </div>
                                    
                                    {selectedApplication.measurements && (
                                      <div className="mt-4">
                                        <h4 className="text-sm font-medium">Measurements</h4>
                                        <div className="grid grid-cols-2 gap-2 mt-1 text-sm">
                                          {Object.entries(selectedApplication.measurements).map(([key, value]) => (
                                            <p key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}: {value}</p>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {selectedApplication.notes && (
                                  <div>
                                    <h3 className="font-semibold mb-2">Notes</h3>
                                    <p className="text-gray-700">{selectedApplication.notes}</p>
                                  </div>
                                )}

                                {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                                  <div>
                                    <h3 className="font-semibold mb-2">Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedApplication.skills.map((skill, index) => (
                                        <span 
                                          key={index}
                                          className="px-2 py-1 bg-gray-100 rounded text-sm"
                                        >
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Update Status
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => statusMutation.mutate({ id: app.id, status: 'approved' })}
                            >
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => statusMutation.mutate({ id: app.id, status: 'rejected' })}
                            >
                              Reject
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => statusMutation.mutate({ id: app.id, status: 'on_hold' })}
                            >
                              Put On Hold
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div>
                      <p className="font-medium">No applications found</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {applications && applications.length > 0
                          ? "No applications match the current filter"
                          : "No talent applications have been submitted yet"}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Tabs>
      </Card>
      
      <TalentDatabaseStatus />
    </div>
  );
};

const TalentDatabaseStatus = () => {
  const { data: registrationCounts, isLoading: loadingCounts } = useQuery({
    queryKey: ['talent-registration-counts'],
    queryFn: getTalentRegistrationCounts,
  });

  const { data: syncStatus, isLoading: loadingSyncStatus } = useQuery({
    queryKey: ['talent-sync-status'],
    queryFn: getSyncStatusSummary,
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const syncNeeded = !loadingCounts && registrationCounts && 
    registrationCounts.emergeSubmissions > registrationCounts.talentApplications;

  return (
    <Card className="p-4 bg-gray-50 mt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Talent Database Status</h3>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Auto-Sync Enabled
        </Badge>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between">
          <p>Talent applications count: {loadingCounts ? 'Loading...' : registrationCounts?.talentApplications || '0'}</p>
          <p>Emerge submissions count: {loadingCounts ? 'Loading...' : registrationCounts?.emergeSubmissions || '0'}</p>
        </div>
        
        {!loadingSyncStatus && syncStatus && (
          <div className="flex flex-col sm:flex-row sm:justify-between border-t border-gray-200 pt-2 mt-2">
            <p>Sync rate: <span className="font-medium">{syncStatus.syncPercentage}%</span></p>
            <p>Pending sync: <span className="font-medium">{syncStatus.pendingCount}</span> records</p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row sm:justify-between border-t border-gray-200 pt-2 mt-2">
          <p>Database connection: Active</p>
          <p>Last checked: {new Date().toLocaleString()}</p>
        </div>
        
        <div className="space-y-1 mt-2 pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Real-time auto-sync is active</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Sync monitoring is enabled</span>
          </div>
        </div>
        
        {syncNeeded && (
          <Alert className="mt-4 border-amber-300 bg-amber-50">
            <AlertTitle>Historical Data Sync Required</AlertTitle>
            <AlertDescription>
              There are {registrationCounts?.emergeSubmissions - registrationCounts?.talentApplications} historical submissions 
              from the registration form that need to be synced to the talent management system.
              Use the migration tool below to import these submissions.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <TalentDataMigrationTool />
    </Card>
  );
};

export default TalentManagement;
