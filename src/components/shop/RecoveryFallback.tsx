
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShopProduct } from "@/types/shop";
import { AlertCircle, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RecoveryFallbackProps {
  products: ShopProduct[];
  error?: Error | null;
  level?: 'minimal' | 'medium' | 'full';
  onRefresh?: () => void;  // Optional callback for parent refresh
}

const RecoveryFallback: React.FC<RecoveryFallbackProps> = ({ 
  products, 
  error = null,
  level = 'minimal',
  onRefresh
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Default placeholder image
  const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Cpath d='M30 40 L50 65 L70 40' stroke='%23d1d5db' stroke-width='2' fill='none'/%3E%3Ccircle cx='50' cy='30' r='10' fill='%23d1d5db'/%3E%3C/svg%3E";

  // Safe fetch products function that doesn't rely on external functions
  const fetchProductsDirectly = async () => {
    if (!onRefresh) {
      try {
        setIsLoading(true);
        const { data } = await supabase
          .from('shop_products')
          .select('*')
          .order('created_at', { ascending: false });
          
        setIsLoading(false);
        
        if (onRefresh) {
          onRefresh(); // Call parent refresh if provided
        }
        
        return data || [];
      } catch (e) {
        console.error("Error fetching products in recovery mode:", e);
        setIsLoading(false);
        return [];
      }
    } else {
      // Use provided refresh function if available
      onRefresh();
    }
  };

  // Simplified product display focused on essential data only
  return (
    <div className="p-4">
      {error && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="font-medium text-red-800">Recovery Mode Active</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">
            The shop encountered an error and is running in recovery mode.
            {showDetails ? (
              <span className="block mt-1 font-mono text-xs bg-red-100 p-2 rounded">
                {error.message}
              </span>
            ) : (
              <Button variant="link" size="sm" onClick={() => setShowDetails(true)} className="ml-2">
                Show details
              </Button>
            )}
          </p>
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchProductsDirectly} 
              disabled={isLoading}
              className="text-xs bg-white"
            >
              {isLoading ? 'Loading...' : 'Attempt Data Refresh'}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {(products || []).map(product => {
          // Ensure we have the minimal required data, otherwise skip this product
          if (!product || !product.id) return null;
          
          const title = product.title || 'Untitled Product';
          const price = product.price ?? 0;
          const imageUrl = product.image_url || placeholderImage;
          
          return (
            <Card key={product.id} className="overflow-hidden h-full flex flex-col">
              <div className="aspect-square relative bg-gray-100 flex items-center justify-center overflow-hidden">
                {level === 'minimal' ? (
                  <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                    <Image className="h-8 w-8 text-gray-400" />
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt={title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Set a fallback on error
                      (e.target as HTMLImageElement).src = placeholderImage;
                    }}
                  />
                )}
              </div>
              
              <CardContent className="py-3 flex-grow">
                <h3 className="font-medium text-sm truncate">{title}</h3>
                {level !== 'minimal' && product.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </CardContent>
              
              <CardFooter className="pt-0 pb-3 px-6">
                <span className="font-semibold">${price.toFixed(2)}</span>
              </CardFooter>
            </Card>
          );
        })}
      </div>
      
      {(!products || products.length === 0) && (
        <div className="text-center py-10">
          <p className="text-gray-500">No products available in recovery mode</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={fetchProductsDirectly} 
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Attempt to Load Products'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecoveryFallback;
