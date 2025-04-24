
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "../hooks/useCart";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useState } from "react";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  // This would typically come from an API/database
  const product = {
    id: Number(id),
    name: "Emerge T-Shirt",
    price: "ETB 4,800",
    description: "Premium quality Ethiopian cotton t-shirt with modern design.",
    image: "/placeholder.svg"
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity
    });
  };

  return (
    <MainLayout>
      <div className="emerge-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-100 aspect-square">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="space-y-6">
            <h1 className="text-3xl font-medium">{product.name}</h1>
            <p className="text-2xl">{product.price}</p>
            <p className="text-gray-600">{product.description}</p>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 border rounded"
              >
                <Minus size={20} />
              </button>
              <span className="text-xl">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 border rounded"
              >
                <Plus size={20} />
              </button>
            </div>

            <Button 
              onClick={handleAddToCart}
              className="w-full py-6 text-lg bg-emerge-gold hover:bg-emerge-darkGold"
            >
              <ShoppingCart className="mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetail;
