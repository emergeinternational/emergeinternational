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

  const { data: designers, isLoading, error } = useQuery({
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
      designer.specialty.toLowerCase().includes(query)
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

      // Optimistically update the cache
      // queryClient.setQueryData(['designers'], (old: Designer[] | undefined) => {
      //   return old?.filter((designer) => designer.id !== id);
      // });

      toast({
        title: "Designer deleted",
        description: "The designer has been successfully deleted.",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting designer",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Designers</h2>
        <div className="flex items-center space-x-4">
          <input
            type="search"
            placeholder="Search designers..."
            className="border rounded-md px-3 py-2 w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleCreate}
          >
            Add Designer
          </button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading designers...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <DesignersTable
          designers={filteredDesigners}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {isFormOpen && (
        <DesignerForm
          open={isFormOpen}
          setOpen={setIsFormOpen}
          designer={selectedDesigner}
        />
      )}
    </div>
  );
};

export default DesignersManager;
