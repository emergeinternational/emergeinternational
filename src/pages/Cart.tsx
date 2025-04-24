
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "../hooks/useCart";
import { Plus, Minus, Trash } from "lucide-react";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, total } = useCart();

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="emerge-container py-16 text-center">
          <h1 className="text-2xl mb-4">Your cart is empty</h1>
          <Link to="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="emerge-container py-8">
        <h1 className="text-3xl mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-4 p-4 border rounded">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-24 h-24 object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-gray-600">{item.price}</p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1 border rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1 border rounded"
                    >
                      <Plus size={16} />
                    </button>
                    
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 p-1"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <div className="border rounded p-4 space-y-4">
              <div className="flex justify-between text-xl font-medium">
                <span>Total</span>
                <span>{total}</span>
              </div>
              
              <Link to="/payment">
                <Button className="w-full bg-emerge-gold hover:bg-emerge-darkGold">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Cart;
