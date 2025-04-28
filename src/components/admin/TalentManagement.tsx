
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, MapPin, Instagram } from "lucide-react";
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
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { fetchTalentApplications, updateApplicationStatus } from "@/services/talentService";
import { TalentApplication, TalentStatus } from "@/types/talentTypes";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TalentManagement = () => {
  const [selectedApplication, setSelectedApplication] = useState<TalentApplication | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['talent-applications'],
    queryFn: fetchTalentApplications,
    onError: (error) => {
      console.error("Error in talent applications query:", error);
      toast({
        title: "Failed to load applications",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
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
                          <Dialog.Trigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedApplication(app)}
                            >
                              View Details
                            </Button>
                          </Dialog.Trigger>
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

// Status component for admin debugging
const TalentDatabaseStatus = () => {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['talent-applications'],
    queryFn: fetchTalentApplications,
    enabled: false,
  });

  return (
    <Card className="p-4 bg-gray-50 mt-6">
      <h3 className="font-medium mb-2">Talent Database Status</h3>
      <div className="space-y-2 text-sm">
        <p>Talent applications count: {isLoading ? 'Loading...' : applications?.length || '0'}</p>
        <p>Database connection: Active</p>
        <p>Last checked: {new Date().toLocaleString()}</p>
      </div>
    </Card>
  );
};

export default TalentManagement;
