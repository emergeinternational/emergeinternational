
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Shield, ExternalLink } from "lucide-react";
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

type TalentStatus = 'pending' | 'approved' | 'rejected' | 'on_hold';

interface TalentApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  skills: string[] | null;
  experience_years: number | null;
  portfolio_url: string | null;
  social_media: any | null;
  status: TalentStatus;
  notes: string | null;
  created_at: string;
}

const TalentManagement = () => {
  const [selectedApplication, setSelectedApplication] = useState<TalentApplication | null>(null);
  const { toast } = useToast();

  const { data: applications, isLoading, refetch } = useQuery({
    queryKey: ['talent-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('talent_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TalentApplication[];
    }
  });

  const updateApplicationStatus = async (id: string, status: TalentStatus) => {
    try {
      const { error } = await supabase
        .from('talent_applications')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Application status has been updated to ${status}`
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error updating status",
        description: "There was an error updating the application status",
        variant: "destructive"
      });
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Applications</h2>
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Experience</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                Loading applications...
              </TableCell>
            </TableRow>
          ) : !applications?.length ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8">
                No applications found
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>
                  <div className="font-medium">{app.full_name}</div>
                  <div className="text-sm text-gray-500">
                    Applied {new Date(app.created_at).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>
                  <div>{app.email}</div>
                  {app.phone && (
                    <div className="text-sm text-gray-500">{app.phone}</div>
                  )}
                </TableCell>
                <TableCell>
                  {app.experience_years ? `${app.experience_years} years` : 'N/A'}
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
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h3 className="font-semibold">Personal Information</h3>
                                <p>Name: {selectedApplication.full_name}</p>
                                <p>Email: {selectedApplication.email}</p>
                                {selectedApplication.phone && (
                                  <p>Phone: {selectedApplication.phone}</p>
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold">Professional Details</h3>
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
                            </div>
                            {selectedApplication.skills && (
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
                          onClick={() => updateApplicationStatus(app.id, 'approved')}
                        >
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateApplicationStatus(app.id, 'rejected')}
                        >
                          Reject
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => updateApplicationStatus(app.id, 'on_hold')}
                        >
                          Put On Hold
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TalentManagement;
