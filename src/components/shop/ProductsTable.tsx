
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShopProduct } from '@/services/shopService';
import { Edit, Trash, AlertTriangle } from "lucide-react";

interface ProductsTableProps {
  products: ShopProduct[];
  isLoading: boolean;
  onEdit: (product: ShopProduct) => void;
  onDelete: (productId: string) => void;
  isLocked?: boolean;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ 
  products, 
  isLoading, 
  onEdit, 
  onDelete,
  isLocked = false 
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                Loading products...
              </TableCell>
            </TableRow>
          ) : products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center h-24">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  <p className="text-muted-foreground">No products found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    {product.image_url ? (
                      <img 
                        src={product.image_url} 
                        alt={product.title} 
                        className="h-10 w-10 rounded-md object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-md bg-gray-100 flex items-center justify-center text-gray-500">
                        No img
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{product.title}</p>
                      <p className="text-xs text-gray-500 max-w-[200px] truncate">
                        {product.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {product.category?.replace('_', ' ') || 'Uncategorized'}
                  </Badge>
                </TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>
                  <Badge variant={product.in_stock ? "default" : "secondary"}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(product)}
                      disabled={isLocked}
                      title={isLocked ? "Unlock page to edit products" : "Edit product"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => onDelete(product.id)}
                      disabled={isLocked}
                      className="text-red-500 hover:text-red-700"
                      title={isLocked ? "Unlock page to delete products" : "Delete product"}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
