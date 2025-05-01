
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
import { Edit, RefreshCw, AlertTriangle } from "lucide-react";
import { RefetchOptions } from '@tanstack/react-query';
import { Product } from '@/services/productTypes';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onRefresh: (options?: RefetchOptions) => void;
  isLocked?: boolean;
}

const ProductsTable: React.FC<ProductsTableProps> = ({ 
  products, 
  isLoading, 
  onEdit, 
  onRefresh,
  isLocked = false 
}) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Products</h2>
        <Button 
          variant="outline" 
          onClick={() => onRefresh()} 
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">
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
                        <p className="text-xs text-gray-500">
                          {product.sku || 'No SKU'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {product.category?.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(product.price)}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        product.in_stock 
                          ? product.stock_quantity > 10 
                            ? 'bg-green-500' 
                            : 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}></div>
                      {product.stock_quantity || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.is_published ? "default" : "secondary"}>
                      {product.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onEdit(product)}
                      disabled={isLocked}
                      title={isLocked ? "Unlock page to edit products" : "Edit product"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductsTable;
