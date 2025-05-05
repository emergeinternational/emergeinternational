
import React from "react";
import { Collection } from "@/types/shop";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CollectionFilterProps {
  collections: Collection[];
  selectedCollection: string | null;
  onCollectionSelect: (collectionId: string | null) => void;
}

const CollectionFilter: React.FC<CollectionFilterProps> = ({
  collections,
  selectedCollection,
  onCollectionSelect,
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Shop by Designer</h3>
      <ScrollArea className="h-auto max-h-48">
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className={!selectedCollection ? "bg-primary text-primary-foreground" : ""}
            onClick={() => onCollectionSelect(null)}
          >
            All Products
          </Button>
          
          {collections.map((collection) => (
            <Button
              key={collection.id}
              variant="outline"
              size="sm"
              className={selectedCollection === collection.id ? "bg-primary text-primary-foreground" : ""}
              onClick={() => onCollectionSelect(collection.id)}
            >
              {collection.title} ({collection.designer_name})
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CollectionFilter;
