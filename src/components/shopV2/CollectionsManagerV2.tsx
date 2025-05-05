
import React, { useState } from 'react';
import { Collection } from '@/types/shopV2';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import { createCollection } from '@/services/shopV2Service';
import { useToast } from '@/hooks/use-toast';

interface CollectionsManagerV2Props {
  collections: Collection[];
  onCollectionAdded: (collection: Collection) => void;
  isLocked?: boolean;
}

const CollectionsManagerV2: React.FC<CollectionsManagerV2Props> = ({ 
  collections,
  onCollectionAdded,
  isLocked = false
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newCollection, setNewCollection] = useState<Partial<Collection>>({
    title: '',
    designer_name: '',
    description: ''
  });
  const { toast } = useToast();

  if (isLocked) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md border border-yellow-200">
          <h3 className="font-medium">Collection Management</h3>
          <p className="text-sm">
            You need admin permissions to manage collections.
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCollection(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCollection = async () => {
    // Form validation
    if (!newCollection.title || !newCollection.designer_name) {
      toast({
        title: "Error",
        description: "Title and designer name are required",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const addedCollection = await createCollection(newCollection);
      
      if (addedCollection) {
        onCollectionAdded(addedCollection);
        setNewCollection({
          title: '',
          designer_name: '',
          description: ''
        });
        setIsAdding(false);
        toast({ title: "Success", description: "Collection added successfully" });
      } else {
        toast({ title: "Error", description: "Failed to add collection", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error adding collection:", error);
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Collections</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Collection
          </Button>
        )}
      </div>
      
      {/* List of collections */}
      {collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map(collection => (
            <Card key={collection.id} className="p-4">
              <div className="font-medium">{collection.title}</div>
              <div className="text-sm text-gray-500">by {collection.designer_name}</div>
              {collection.description && (
                <p className="text-sm mt-2">{collection.description}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No collections available.</p>
      )}
      
      {/* Add new collection form */}
      {isAdding && (
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium">Add New Collection</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Collection Title</Label>
              <Input
                id="title"
                name="title"
                value={newCollection.title || ''}
                onChange={handleInputChange}
                placeholder="Enter collection title"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="designer_name">Designer Name</Label>
              <Input
                id="designer_name"
                name="designer_name"
                value={newCollection.designer_name || ''}
                onChange={handleInputChange}
                placeholder="Enter designer name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                name="description"
                value={newCollection.description || ''}
                onChange={handleInputChange}
                placeholder="Enter collection description"
                rows={3}
              />
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleAddCollection}
                disabled={isLoading || !newCollection.title || !newCollection.designer_name}
              >
                {isLoading ? "Adding..." : "Add Collection"}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CollectionsManagerV2;
