
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Edit, Trash2, Eye } from "lucide-react";

interface ProductsTableProps {
  products: any[];
  isLoading: boolean;
  onEdit: (product: any) => void;
  onRefresh: () => void;
}

const ProductsTable = ({ products, isLoading, onEdit, onRefresh }: ProductsTableProps) => {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) throw error;

      toast({
        title: "Product deleted",
        description: `${productToDelete.title} has been successfully deleted.`,
      });

      onRefresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to delete product: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
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
              <TableHead>In Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
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
                      <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                        <Eye size={16} />
                      </div>
                    )}
                    <span className="truncate max-w-[200px]">{product.title}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">
                    {product.category?.replace(/_/g, " ") || "Uncategorized"}
                  </span>
                </TableCell>
                <TableCell>
                  {product.price ? (
                    <>${parseFloat(product.price).toFixed(2)}</>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell>{product.in_stock ? "Yes" : "No"}</TableCell>
                <TableCell>
                  <Badge 
                    variant={product.is_published ? "default" : "outline"}
                    className={product.is_published ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                  >
                    {product.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(product)}
                    title="Edit product"
                  >
                    <Edit size={16} />
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
                    <Trash2 size={16} />
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
              This action will permanently delete the product "
              {productToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
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
