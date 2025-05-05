
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getProductById } from "../services/shopService";
import { ShopProduct, ProductVariation } from "../types/shop";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  ArrowLeft,
  Edit 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductFormDialog from "../components/shop/ProductFormDialog";
import { hasShopEditAccess } from "@/services/shopAuthService";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const canEdit = hasShopEditAccess();

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    try {
      const data = await getProductById(productId);
      setProduct(data);
      
      // Set first variation as selected by default if available
      if (data?.variations && data.variations.length > 0) {
        setSelectedVariation(data.variations[0]);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(price / 100);
  };

  const handleVariationChange = (variationId: string) => {
    if (product?.variations) {
      const variation = product.variations.find(v => v.id === variationId);
      if (variation) {
        setSelectedVariation(variation);
      }
    }
  };

  // Group variations by their properties
  const groupVariations = () => {
    if (!product?.variations) return { sizes: [], colors: [] };
    
    const sizes = Array.from(new Set(product.variations.filter(v => v.size).map(v => v.size)));
    const colors = Array.from(new Set(product.variations.filter(v => v.color).map(v => v.color)));
    
    return { sizes, colors };
  };
  
  const { sizes, colors } = groupVariations();

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-8">The product you're looking for could not be found.</p>
          <Button onClick={() => navigate("/shop")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/shop")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
            <img
              src={product.image_url || "/placeholder.svg"}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            
            {canEdit && (
              <Button
                className="absolute top-4 right-4 bg-white/80"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit Product
              </Button>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 mb-2">
                {product.category && (
                  <Badge>{product.category}</Badge>
                )}
                
                {product.collection && (
                  <Badge variant="secondary">
                    {product.collection.title} • {product.collection.designer_name}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-2xl font-semibold text-primary">
                {formatPrice(selectedVariation?.price || product.price)}
              </p>
            </div>

            {/* Product Description */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-gray-700">
                {product.description || "No description available."}
              </p>
            </div>

            {/* Product Variations */}
            {product.variations && product.variations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Product Options</h3>
                
                {sizes.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => (
                        <Badge 
                          key={size} 
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {size}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {colors.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <Badge 
                          key={color} 
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100"
                        >
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.variations.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Select Variant</p>
                    <Select
                      onValueChange={handleVariationChange}
                      defaultValue={selectedVariation?.id}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select variant" />
                      </SelectTrigger>
                      <SelectContent>
                        {product.variations.map((variation) => (
                          <SelectItem key={variation.id} value={variation.id || ""}>
                            {[
                              variation.size && `Size: ${variation.size}`,
                              variation.color && `Color: ${variation.color}`,
                              variation.price && `Price: ${formatPrice(variation.price)}`
                            ].filter(Boolean).join(" - ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}

            {/* Availability */}
            <div className="mb-8">
              <div className="flex items-center">
                <div
                  className={`h-3 w-3 rounded-full mr-2 ${
                    product.in_stock ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span>
                  {product.in_stock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              
              {selectedVariation && (
                <p className="text-sm text-gray-500 mt-1">
                  {selectedVariation.stock_quantity} units available • SKU: {selectedVariation.sku}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              <Button
                disabled={!product.in_stock}
                className="w-full bg-black hover:bg-gray-800 text-white"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Form dialog for editing product */}
      <ProductFormDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={product}
        onSuccess={(updatedProduct) => {
          if (updatedProduct) {
            setProduct(updatedProduct);
          }
        }}
      />
    </MainLayout>
  );
};

export default ProductDetail;
