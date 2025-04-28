
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search } from "lucide-react";
import DesignersTable from "./DesignersTable";
import DesignerFormDialog from "./DesignerFormDialog";

const DesignersManager = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDesigner, setEditingDesigner] = useState<any>(null);

  // Fetch all designers
  const { data: designers, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-designers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("designers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Handle designer edit
  const handleEditDesigner = (designer: any) => {
    setEditingDesigner(designer);
    setIsFormOpen(true);
  };

  // Filter designers based on search query
  const filteredDesigners = designers?.filter((designer) =>
    designer.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    designer.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    designer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle form close and refresh data
  const handleFormClose = (refresh: boolean) => {
    setIsFormOpen(false);
    setEditingDesigner(null);
    if (refresh) {
      refetch();
    }
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading designers: {error.message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Search and Add Button Bar */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Search designers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          onClick={() => {
            setEditingDesigner(null);
            setIsFormOpen(true);
          }} 
          className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
        >
          <PlusCircle className="mr-2" size={18} />
          Add New Designer
        </Button>
      </div>

      {/* Designers Table */}
      <DesignersTable 
        designers={filteredDesigners || []} 
        isLoading={isLoading} 
        onEdit={handleEditDesigner}
        onRefresh={refetch}
      />

      {/* Designer Form Dialog */}
      <DesignerFormDialog 
        open={isFormOpen}
        designer={editingDesigner}
        onClose={handleFormClose}
      />
    </div>
  );
};

export default DesignersManager;
