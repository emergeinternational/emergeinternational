
import React from "react";
import { Link } from "react-router-dom";
import { Product, formatPrice } from "../../services/shopService";
import { Globe } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <Link to={`/shop/product/${product.id}`} className="group">
      <div className="bg-gray-100 aspect-square mb-3 overflow-hidden">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <h3 className="font-medium">{product.title}</h3>
      <p className="text-gray-700">{formatPrice(product.price)}</p>
      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
        <Globe size={12} />
        <span>International Shipping Available</span>
      </div>
    </Link>
  );
};

export default ProductCard;
