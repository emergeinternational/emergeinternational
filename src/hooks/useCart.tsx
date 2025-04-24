
import { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "./use-toast";

type CartItem = {
  id: number;
  name: string;
  price: string;
  image: string;
  quantity: number;
  shippingAddressId?: string; // Added shippingAddressId as optional property
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  total: string;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems(current => {
      const existingItem = current.find(i => i.id === item.id);
      if (existingItem) {
        return current.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...current, item];
    });
    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`
    });
  };

  const removeFromCart = (id: number) => {
    setItems(current => current.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity < 1) return;
    setItems(current =>
      current.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items
    .reduce((sum, item) => {
      const price = parseInt(item.price.replace(/\D/g, ""));
      return sum + (price * item.quantity);
    }, 0)
    .toLocaleString("en-ET", { style: "currency", currency: "ETB" })
    .replace("ETB", "ETB ");

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
