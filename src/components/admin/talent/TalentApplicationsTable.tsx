
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Instagram, MapPin } from "lucide-react";
import TalentDetailsDialog from "./TalentDetailsDialog";

type TalentStatus = 'pending' | 'approved' | 'rejected' | 'on_hold';

interface TalentApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  skills: string[] | null;
  experience_years: number | null;
  portfolio_url: string | null;
  social_media: {
    instagram?: string;
    tiktok?: string;
    telegram?: string;
  } | null;
  status: TalentStatus;
  notes: string | null;
  created_at: string;
  country: string | null;
  age: number | null;
  category_type: string | null;
  photo_url: string | null;
  gender: string | null;
}

interface TalentApplicationsTableProps {
  applications: TalentApplication[] | undefined;
  isLoading: boolean;
  isRefreshing: boolean;
}

const TalentApplicationsTable = ({
  applications,
  isLoading,
  isRefreshing
}: TalentApplicationsTableProps) => {
  const [selectedApplication, setSelectedApplication] = useState<TalentApplication | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();

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

      // Update the local state
      if (applications) {
        // Note: This will be overridden when the parent component refetches the data
        const updatedApplications = applications.map(app => 
          app.id === id ? { ...app, status } : app
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
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
    <>
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
          ) : !applications?.length ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                No applications found
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => (
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedApplication(app);
                        setIsDetailsOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                    
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

      <TalentDetailsDialog
        application={selectedApplication}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </>
  );
};

export default TalentApplicationsTable;
