
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Designer } from "@/services/designerTypes";
import DesignerForm from "./DesignerForm";
import DesignersTable from "./DesignersTable";
import { useToast } from "@/hooks/use-toast";

const DesignersManager = () => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDesigner, setSelectedDesigner] = useState<Designer | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: designers, isLoading, error, refetch } = useQuery({
    queryKey: ['designers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('designers')
        .select('*');
      if (error) throw error;
      return data as Designer[];
    },
  });

  const filteredDesigners = designers?.filter(designer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      designer.full_name.toLowerCase().includes(query) ||
      designer.email?.toLowerCase().includes(query) ||
      designer.specialty.toLowerCase().includes(query) ||
      designer.category.toLowerCase().includes(query) ||
      designer.location?.toLowerCase().includes(query)
    );
  }) ?? [];

  const handleCreate = () => {
    setSelectedDesigner(null);
    setIsFormOpen(true);
  };

  const handleEdit = (designer: Designer) => {
    setSelectedDesigner(designer);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('designers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Creative professional deleted",
        description: "The creative professional has been successfully deleted.",
      });
      
      // Refresh the data
      refetch();
    } catch (error: any) {
      toast({
        title: "Error deleting creative professional",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Creative Professionals</h2>
        <div className="flex items-center space-x-4">
          <input
            type="search"
            placeholder="Search professionals..."
            className="border rounded-md px-3 py-2 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreate}
          >
            Add Creative Professional
          </button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading creative professionals...</p>
      ) : error ? (
        <p className="text-red-500">Error: {(error as Error).message}</p>
      ) : (
        <DesignersTable
          designers={filteredDesigners}
          isLoading={false}
          onEdit={handleEdit}
          onRefresh={refetch}
        />
      )}

      {isFormOpen && (
        <DesignerForm
          open={isFormOpen}
          setOpen={setIsFormOpen}
          designer={selectedDesigner}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};

export default DesignersManager;
