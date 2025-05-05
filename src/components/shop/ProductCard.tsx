
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShopProduct } from "@/types/shop";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: ShopProduct;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price / 100);
  };
  
  const handleClick = () => {
    navigate(`/shop/product/${product.id}`);
  };
  
  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-square relative">
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.title}
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
      </div>
      <CardHeader className="pb-2">
        <h3 className="font-medium text-lg">{product.title}</h3>
      </CardHeader>
      <CardContent className="pb-2">
        {product.category && (
          <Badge variant="outline" className="mb-2">{product.category}</Badge>
        )}
        <p className="text-sm text-gray-500 line-clamp-2">
          {product.description || 'No description available'}
        </p>
      </CardContent>
      <CardFooter>
        <p className="font-semibold text-lg">{formatPrice(product.price)}</p>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
