
import React, { useState } from "react";
import { format } from "date-fns";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Designer } from "@/services/designerTypes";
import { Edit, MoreHorizontal, Trash, Eye } from "lucide-react";
import DesignerDetailsCard from "./DesignerDetailsCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DesignersTableProps {
  designers: Designer[];
  isLoading: boolean;
  onEdit: (designer: Designer) => void;
  onRefresh: () => void;
}

const DesignersTable = ({
  designers,
  isLoading,
  onEdit,
  onRefresh,
}: DesignersTableProps) => {
  const { toast } = useToast();
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [designerToDelete, setDesignerToDelete] = useState<Designer | null>(null);

  const handleViewDetails = (designer: Designer) => {
    setSelectedDesigner(designer);
  };

  const handleCloseDetails = () => {
    setSelectedDesigner(null);
  };

  const confirmDelete = (designer: Designer) => {
    setDesignerToDelete(designer);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!designerToDelete) return;

    try {
      const { error } = await supabase
        .from("designers")
        .delete()
        .eq("id", designerToDelete.id);

      if (error) throw error;

      toast({
        title: "Creative professional deleted",
        description: `${designerToDelete.full_name} has been removed successfully.`,
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete creative professional",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setDesignerToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Loading creative professionals...</p>
      </div>
    );
  }

  if (designers.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg">
        <p className="text-gray-500">No creative professionals found</p>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const getCategoryLabel = (category: string): string => {
    const categories: Record<string, string> = {
      fashion_designer: "Fashion Designer",
      interior_designer: "Interior Designer",
      graphic_designer: "Graphic Designer",
      visual_artist: "Visual Artist",
      photographer: "Photographer",
      event_planner: "Event Planner",
      model: "Model",
      creative_director: "Creative Director",
    };
    return categories[category] || category;
  };

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Specialty</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {designers.map((designer) => (
              <TableRow key={designer.id}>
                <TableCell className="font-medium flex items-center gap-3">
                  {designer.image_url && (
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <img
                        src={designer.image_url}
                        alt={designer.full_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  {designer.full_name}
                </TableCell>
                <TableCell>{getCategoryLabel(designer.category)}</TableCell>
                <TableCell className="capitalize">{designer.specialty}</TableCell>
                <TableCell>
                  {designer.featured ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800">
                      Featured
                    </Badge>
                  ) : (
                    <Badge variant="outline">Standard</Badge>
                  )}
                </TableCell>
                <TableCell>{formatDate(designer.created_at)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(designer)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(designer)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => confirmDelete(designer)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedDesigner && (
        <div className="mt-6">
          <DesignerDetailsCard
            designer={selectedDesigner}
            onEdit={() => onEdit(selectedDesigner)}
            onClose={handleCloseDetails}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {designerToDelete?.full_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DesignersTable;
