
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DesignersTableProps {
  designers: any[];
  isLoading: boolean;
  onEdit: (designer: any) => void;
  onRefresh: () => void;
  isLocked?: boolean;
}

const DesignersTable = ({ designers, isLoading, onEdit, onRefresh, isLocked = false }: DesignersTableProps) => {
  const { toast } = useToast();

  const handleDelete = async (id: string) => {
    if (isLocked) {
      toast({
        title: "Page is locked",
        description: "Unable to delete while the page is locked. Please unlock first.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm("Are you sure you want to delete this designer? This action cannot be undone.")) {
      try {
        const { error } = await supabase
          .from("designers")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Designer deleted",
          description: "The designer has been successfully deleted.",
        });

        onRefresh();
      } catch (error: any) {
        toast({
          title: "Error",
          description: `Failed to delete designer: ${error.message}`,
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!designers.length) {
    return <div className="text-center py-8 text-gray-500">No designers found</div>;
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {designers.map((designer) => (
            <TableRow key={designer.id}>
              <TableCell className="font-medium">{designer.full_name}</TableCell>
              <TableCell>{designer.email}</TableCell>
              <TableCell>{designer.specialty}</TableCell>
              <TableCell>{designer.location || "N/A"}</TableCell>
              <TableCell>
                {designer.featured ? (
                  <Badge className="bg-emerge-gold text-black">Featured</Badge>
                ) : (
                  <Badge variant="outline">Standard</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(designer)} disabled={isLocked}>
                    <Pencil className="h-4 w-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => handleDelete(designer.id)}
                    disabled={isLocked}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DesignersTable;
