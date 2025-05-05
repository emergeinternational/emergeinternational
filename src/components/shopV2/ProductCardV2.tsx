
import React from 'react';
import { ShopProductV2 } from '@/types/shopV2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';

interface ProductCardV2Props {
  product: ShopProductV2;
  isAdmin?: boolean;
  onEdit?: (product: ShopProductV2) => void;
  onDelete?: (id: string) => void;
}

const ProductCardV2: React.FC<ProductCardV2Props> = ({ 
  product, 
  isAdmin = false,
  onEdit,
  onDelete
}) => {
  // Format price to include currency symbol
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price || 0);

  // Handle status-based display
  const getStatusBadge = () => {
    if (!isAdmin) return null;
    
    const statusClasses = {
      draft: "bg-gray-200 text-gray-800",
      pending: "bg-yellow-200 text-yellow-800",
      published: "bg-green-200 text-green-800",
      rejected: "bg-red-200 text-red-800"
    };

    return (
      <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded-md ${statusClasses[product.status]}`}>
        {product.status}
      </span>
    );
  };

  const handleEdit = () => {
    if (onEdit) onEdit(product);
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this product?')) {
      onDelete(product.id);
    }
  };

  return (
    <Card className="relative overflow-hidden flex flex-col h-full">
      {getStatusBadge()}
      
      <div className="relative aspect-square">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-0">
        <h3 className="font-medium line-clamp-1">{product.title}</h3>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow">
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
        )}
        <div className="font-bold">{formattedPrice}</div>
        
        {product.variations && product.variations.length > 0 && (
          <div className="text-xs text-gray-500 mt-1">
            {product.variations.length} variation{product.variations.length !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
      
      {isAdmin && (
        <CardFooter className="p-4 pt-0 flex justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEdit}
            className="h-8 px-2"
          >
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleDelete}
            className="h-8 px-2"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCardV2;
