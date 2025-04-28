
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Globe } from "lucide-react";
import { Product } from "@/services/productTypes";

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onRefresh: () => void;
}

const ProductsTable = ({ products, isLoading, onEdit, onDelete, onRefresh }: ProductsTableProps) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    
    onDelete(productToDelete.id);
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const isMockProduct = (product: Product) => {
    return product.id.startsWith('mock-');
  };

  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerge-gold border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-500">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-10 text-center border rounded-lg">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="cursor-pointer hover:bg-gray-50">
                <TableCell className="font-medium" onClick={() => onEdit(product)}>
                  <div className="flex items-center space-x-3">
                    {product.image_url ? (
                      <div className="h-10 w-10 bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={product.image_url} 
                          alt={product.title} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-gray-100 rounded-md" />
                    )}
                    <div>
                      <div className="truncate max-w-[200px]">{product.title}</div>
                      {isMockProduct(product) && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] mt-1">
                          Mock Product
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell onClick={() => onEdit(product)}>
                  <span className="capitalize">
                    {product.category?.replace(/_/g, " ") || "Uncategorized"}
                  </span>
                </TableCell>
                <TableCell onClick={() => onEdit(product)}>
                  {product.price ? (
                    <>${parseFloat(product.price.toString()).toFixed(2)}</>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell onClick={() => onEdit(product)}>
                  <Badge variant="outline" className={
                    product.in_stock 
                      ? "bg-green-100 text-green-800 hover:bg-green-100" 
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }>
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </TableCell>
                <TableCell onClick={() => onEdit(product)}>
                  <Badge 
                    variant={product.is_published ? "default" : "outline"}
                    className={product.is_published ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                  >
                    {product.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell onClick={() => onEdit(product)}>
                  {product.sales_count || 0}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                    title="Edit product"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 hover:text-red-700"
                    title="Delete product"
                    onClick={() => {
                      setProductToDelete(product);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 size={16} className="mr-1" />
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {productToDelete?.id.startsWith('mock-') ? (
                <>This will remove the mock product "{productToDelete?.title}" from the UI.</>
              ) : (
                <>This action will permanently delete the product "{productToDelete?.title}". This action cannot be undone.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductsTable;
