
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Collection } from "@/types/shop";
import { getCollections, deleteCollection } from "@/services/collectionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash2, RefreshCw } from "lucide-react";
import { getAuthStatus, hasShopEditAccess } from "@/services/shopAuthService";
import CollectionFormDialog from "./CollectionFormDialog";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger 
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

  // Fetch collections on component mount
  useEffect(() => {
    fetchCollections();
    
    // Subscribe to changes
    const collectionsChannel = supabase
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
      supabase.removeChannel(collectionsChannel);
    };
  }, []);

  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      const collectionsData = await getCollections();
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast({
        title: "Error loading collections",
        description: error instanceof Error ? error.message : "Failed to load collections",
        variant: "destructive"
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
        variant: "destructive"
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
        variant: "destructive"
      });
      return;
    }
    
    try {
      const success = await deleteCollection(collectionId);
      if (success) {
        setCollections(prev => prev.filter(collection => collection.id !== collectionId));
        toast({
          title: "Collection deleted",
          description: "Collection has been successfully deleted"
        });
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast({
        title: "Error",
        description: "Failed to delete collection",
        variant: "destructive"
      });
    }
  };

  // If user doesn't have permission, don't render the component
  if (!isAdmin && !isLocked) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have permission to access this page</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Collections</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchCollections} 
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          {canEdit && (
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-emerge-gold text-black hover:bg-emerge-gold/80"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Collection
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : collections.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-500">No collections found</p>
            {canEdit && (
              <Button 
                variant="link" 
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add your first collection
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map(collection => (
            <Card key={collection.id} className="relative">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <div>
                    {collection.title}
                    <div className="text-sm font-normal text-gray-500">
                      Designer: {collection.designer_name}
                    </div>
                  </div>
                  
                  {canEdit && (
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEdit(collection)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Collection</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{collection.title}"? This will not delete products in this collection.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(collection.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collection.description ? (
                  <p className="text-sm text-gray-500">{collection.description}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No description</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Form dialog for adding new collections */}
      <CollectionFormDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        collection={null}
        onSuccess={(newCollection) => {
          if (newCollection) {
            setCollections(prev => [newCollection, ...prev]);
          }
          setIsAddDialogOpen(false);
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
              setCollections(prev => prev.map(collection => 
                collection.id === updatedCollection.id ? updatedCollection : collection
              ));
            }
            setSelectedCollection(null);
            setIsEditDialogOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CollectionsManager;
