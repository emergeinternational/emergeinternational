
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Collection } from "@/types/shop";
import { getCollections, deleteCollection } from "@/services/collectionService";
import { getAuthStatus, hasShopEditAccess } from "@/services/shopAuthService";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, AlertTriangle } from "lucide-react";
import CollectionFormDialog from "./CollectionFormDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CollectionsManagerProps {
  isLocked?: boolean;
}

const CollectionsManager: React.FC<CollectionsManagerProps> = ({ isLocked = false }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { isAdmin } = getAuthStatus();
  const canEdit = !isLocked && hasShopEditAccess();

  useEffect(() => {
    fetchCollections();

    // Subscribe to changes
    const channel = supabase
      .channel('collections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collections'
        },
        (payload) => {
          console.log('Collection change detected:', payload);
          fetchCollections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
      toast({
        title: "Error loading collections",
        description: "Failed to load collections",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (collection: Collection) => {
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit collections",
        variant: "destructive",
      });
      return;
    }
    setSelectedCollection(collection);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (collectionId: string) => {
    if (!canEdit) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to delete collections",
        variant: "destructive",
      });
      return;
    }

    try {
      const success = await deleteCollection(collectionId);
      if (success) {
        setCollections(collections.filter((c) => c.id !== collectionId));
        toast({
          title: "Success",
          description: "Collection deleted successfully",
        });
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Designer Collections</h2>
        {canEdit && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Collection
          </Button>
        )}
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collection Title</TableHead>
              <TableHead>Designer</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Loading collections...
                </TableCell>
              </TableRow>
            ) : collections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                    <p className="text-muted-foreground">No collections found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              collections.map((collection) => (
                <TableRow key={collection.id}>
                  <TableCell className="font-medium">{collection.title}</TableCell>
                  <TableCell>{collection.designer_name}</TableCell>
                  <TableCell className="max-w-sm truncate">
                    {collection.description || "No description"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(collection)}
                        disabled={isLocked}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isLocked}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{collection.title}"? Products
                              in this collection will not be deleted but they will no longer
                              be associated with this collection.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() => handleDelete(collection.id)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Form dialog for adding new collections */}
      <CollectionFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        collection={null}
        onSuccess={(newCollection) => {
          if (newCollection) {
            setCollections((prev) => [newCollection, ...prev]);
          }
        }}
      />

      {/* Form dialog for editing existing collections */}
      {selectedCollection && (
        <CollectionFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          collection={selectedCollection}
          onSuccess={(updatedCollection) => {
            if (updatedCollection) {
              setCollections((prev) =>
                prev.map((collection) =>
                  collection.id === updatedCollection.id
                    ? updatedCollection
                    : collection
                )
              );
            }
            setSelectedCollection(null);
          }}
        />
      )}
    </div>
  );
};

export default CollectionsManager;
