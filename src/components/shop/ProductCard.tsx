
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShopProduct } from "@/types/shop";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ErrorBoundary from "./ErrorBoundary";
import { 
  Edit, 
  Trash2,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";
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

interface ProductCardProps {
  product: ShopProduct;
  onEdit?: (product: ShopProduct) => void; 
  onDelete?: (productId: string) => void;
  canEdit?: boolean;
  listView?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product,
  onEdit,
  onDelete,
  canEdit = false,
  listView = false
}) => {
  const navigate = useNavigate();
  const [showVariations, setShowVariations] = useState(false);
  
  // Get unique variation attributes
  const uniqueSizes = Array.from(new Set(product.variations?.map(v => v.size).filter(Boolean)));
  const uniqueColors = Array.from(new Set(product.variations?.map(v => v.color).filter(Boolean)));
  
  const hasVariations = product.variations && product.variations.length > 0;
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };
  
  const handleClick = () => {
    navigate(`/shop/product/${product.id}`);
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the button
    // This is non-functional for now as requested
    console.log("Add to cart clicked for:", product.title);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = (productId: string) => {
    if (onDelete) {
      onDelete(productId);
    }
  };

  const toggleVariations = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowVariations(!showVariations);
  };

  if (listView) {
    return (
      <ErrorBoundary
        fallback={
          <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer mb-2">
            <CardContent className="p-4">
              <p className="text-center text-gray-500">Error displaying product</p>
            </CardContent>
          </Card>
        }
      >
        <Card 
          className="overflow-hidden transition-all hover:shadow-lg cursor-pointer mb-2"
          onClick={handleClick}
        >
          <div className="flex">
            <div className="w-24 h-24 relative flex-shrink-0">
              <img 
                src={product.image_url || '/placeholder.svg'} 
                alt={product.title || "Product"}
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              {!product.in_stock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-xs font-semibold">
                    Out of Stock
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{product.title}</h3>
                  <p className="font-semibold text-lg">{formatPrice(product.price || 0)}</p>
                </div>
                
                <div className="flex gap-2">
                  {canEdit && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={handleEdit}
                        className="h-8 w-8"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{product.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(product.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                  
                  <Button 
                    size="sm" 
                    onClick={handleAddToCart}
                    disabled={!product.in_stock}
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {product.category && (
                  <Badge variant="outline" className="text-xs">
                    {product.category}
                  </Badge>
                )}
                {product.collection && (
                  <Badge variant="secondary" className="text-xs">
                    {product.collection.title}
                  </Badge>
                )}
              </div>
              
              {hasVariations && (
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1 text-xs"
                    onClick={toggleVariations}
                  >
                    {showVariations ? "Hide Options" : "Show Options"}
                    {showVariations ? (
                      <ChevronUp className="ml-1 h-3 w-3" />
                    ) : (
                      <ChevronDown className="ml-1 h-3 w-3" />
                    )}
                  </Button>
                  
                  {showVariations && (
                    <div className="mt-1">
                      {uniqueSizes.length > 0 && (
                        <div className="mb-1">
                          <span className="text-xs font-semibold mr-2">Sizes:</span>
                          <div className="inline-flex flex-wrap gap-1">
                            {uniqueSizes.map(size => (
                              <Badge key={size} variant="outline" className="text-xs">
                                {size}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {uniqueColors.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold mr-2">Colors:</span>
                          <div className="inline-flex flex-wrap gap-1">
                            {uniqueColors.map(color => (
                              <Badge key={color} variant="secondary" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <Card className="overflow-hidden transition-all hover:shadow-lg cursor-pointer h-full">
          <CardContent className="p-4">
            <p className="text-center text-gray-500">Error displaying product</p>
          </CardContent>
        </Card>
      }
    >
      <Card 
        className={cn(
          "overflow-hidden transition-all hover:shadow-lg cursor-pointer",
          canEdit && "group"
        )}
        onClick={handleClick}
      >
        <div className="aspect-square relative">
          <img 
            src={product.image_url || '/placeholder.svg'} 
            alt={product.title || "Product"}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
          {!product.in_stock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg font-semibold">
                Out of Stock
              </Badge>
            </div>
          )}
          {canEdit && (
            <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="secondary"
                size="icon"
                onClick={handleEdit}
                className="bg-white/80 hover:bg-white"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{product.title}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(product.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <h3 className="font-medium text-lg">{product.title}</h3>
          <div className="flex flex-wrap gap-1">
            {product.category && (
              <Badge variant="outline" className="w-fit">
                {product.category}
              </Badge>
            )}
            {product.collection && (
              <Badge variant="secondary" className="w-fit">
                {product.collection.title} • {product.collection.designer_name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-gray-500 line-clamp-2">
            {product.description || 'No description available'}
          </p>
          
          {hasVariations && (
            <div className="mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 py-1 -ml-2 text-xs"
                onClick={toggleVariations}
              >
                {showVariations ? "Hide Options" : "Show Options"}
                {showVariations ? (
                  <ChevronUp className="ml-1 h-3 w-3" />
                ) : (
                  <ChevronDown className="ml-1 h-3 w-3" />
                )}
              </Button>
              
              {showVariations && (
                <div className="mt-1">
                  {uniqueSizes.length > 0 && (
                    <div className="mb-1">
                      <span className="text-xs font-semibold">Sizes:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {uniqueSizes.map(size => (
                          <Badge key={size} variant="outline" className="text-xs">
                            {size}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {uniqueColors.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold">Colors:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {uniqueColors.map(color => (
                          <Badge key={color} variant="secondary" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div>
            <p className="font-semibold text-lg">{formatPrice(product.price || 0)}</p>
            {hasVariations && (
              <p className="text-xs text-muted-foreground">
                {product.variations?.length} {product.variations?.length === 1 ? 'variant' : 'variants'}
              </p>
            )}
          </div>
          <Button 
            size="sm" 
            onClick={handleAddToCart}
            disabled={!product.in_stock}
          >
            Add to Cart
          </Button>
        </CardFooter>
      </Card>
    </ErrorBoundary>
  );
};

export default ProductCard;
