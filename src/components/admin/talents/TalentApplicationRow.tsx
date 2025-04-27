
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TalentApplication } from "../../../types/talent";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface TalentApplicationRowProps {
  app: TalentApplication;
  onViewDetails: (app: TalentApplication) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export const TalentApplicationRow = ({
  app,
  onViewDetails,
  onUpdateStatus
}: TalentApplicationRowProps) => {
  return (
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
          Applied {format(new Date(app.created_at), "PPp")}
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
          <Badge variant="outline">
            {app.category_type}
          </Badge>
        ) : (
          'N/A'
        )}
      </TableCell>
      <TableCell>
        <Badge 
          variant={
            app.status === 'approved' ? 'success' :
            app.status === 'rejected' ? 'destructive' :
            app.status === 'pending' ? 'warning' : 'default'
          }
        >
          {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onViewDetails(app)}
          >
            View Details
          </Button>
          <Button 
            variant="default" 
            size="sm"
            onClick={() => onUpdateStatus(app.id, 'approved')}
            disabled={app.status === 'approved'}
          >
            Approve
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
