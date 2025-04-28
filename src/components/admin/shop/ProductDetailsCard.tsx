
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Eye } from "lucide-react";
import { Product, ProductVariation } from "@/services/productTypes";

interface ProductDetailsCardProps {
  product: Product;
  onEdit: () => void;
}

const ProductDetailsCard = ({ product, onEdit }: ProductDetailsCardProps) => {
  const [showVariations, setShowVariations] = useState(false);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderVariations = (variations?: ProductVariation[]) => {
    if (!variations || variations.length === 0) return null;
    
    return (
      <div className="mt-4 border-t pt-4">
        <h3 className="font-medium mb-2">Variations</h3>
        <div className="space-y-3">
          {variations.map((variation, index) => (
            <div key={index} className="border rounded p-2">
              <h4 className="font-medium">{variation.name}</h4>
              <div className="mt-1 flex flex-wrap gap-1">
                {variation.options.map((option, optIndex) => (
                  <Badge key={optIndex} variant="outline" className="text-xs">
                    {option}
                    {variation.price_adjustments?.[optIndex] !== 0 && (
                      <span className={variation.price_adjustments?.[optIndex] > 0 ? "text-green-600" : "text-red-600"}>
                        {" "}({variation.price_adjustments?.[optIndex] > 0 ? "+" : ""}
                        {formatPrice(variation.price_adjustments?.[optIndex] || 0)})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{product.title}</CardTitle>
          <Button size="sm" variant="ghost" onClick={onEdit} title="Edit product">
            <Pencil size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="rounded-md w-full h-auto object-cover aspect-square"
              />
            ) : (
              <div className="bg-gray-100 rounded-md w-full aspect-square flex items-center justify-center">
                <Eye size={40} className="text-gray-400" />
              </div>
            )}
          </div>
          
          <div className="md:w-2/3">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Category</span>
                <p className="capitalize">{product.category?.replace(/_/g, " ") || "Uncategorized"}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Price</span>
                <p className="text-lg font-semibold">{formatPrice(product.price)}</p>
              </div>
              
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={product.is_published ? "default" : "outline"}>
                    {product.is_published ? "Published" : "Draft"}
                  </Badge>
                  <Badge 
                    variant={product.in_stock ? "default" : "destructive"}
                    className={product.in_stock ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                  >
                    {product.in_stock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>
              </div>
              
              {product.description && (
                <div>
                  <span className="text-sm text-gray-500">Description</span>
                  <p className="text-sm mt-1">{product.description}</p>
                </div>
              )}
              
              {product.variations && product.variations.length > 0 && (
                <div>
                  <Button
                    variant="outline" 
                    size="sm"
                    className="mt-2"
                    onClick={() => setShowVariations(!showVariations)}
                  >
                    {showVariations ? "Hide Variations" : "Show Variations"}
                  </Button>
                  
                  {showVariations && renderVariations(product.variations)}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductDetailsCard;
