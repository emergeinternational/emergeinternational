
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "../hooks/useCart";
import { ShoppingCart, Plus, Minus, Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import AddressForm from "@/components/profile/AddressForm";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressDialog, setShowAddressDialog] = useState(false);

  // This would typically come from an API/database
  const product = {
    id: Number(id),
    name: "Emerge T-Shirt",
    price: "ETB 4,800",
    description: "Premium quality Ethiopian cotton t-shirt with modern design.",
    image: "/placeholder.svg"
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    const { data, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .order('is_default', { ascending: false });
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load shipping addresses",
        variant: "destructive"
      });
      return;
    }
    
    setAddresses(data || []);
    if (data && data.length > 0) {
      const defaultAddress = data.find(addr => addr.is_default) || data[0];
      setSelectedAddressId(defaultAddress.id);
    }
  };

  const handleAddToCart = () => {
    if (!selectedAddressId) {
      toast({
        title: "Shipping Address Required",
        description: "Please select or add a shipping address to continue",
        variant: "destructive"
      });
      return;
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      shippingAddressId: selectedAddressId
    });

    navigate("/cart");
  };

  const handleAddressSuccess = () => {
    setShowAddressDialog(false);
    loadAddresses();
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

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Shipping Address</h3>
              {addresses.length > 0 ? (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-3 border rounded cursor-pointer ${
                        selectedAddressId === address.id ? 'border-emerge-gold' : ''
                      }`}
                      onClick={() => setSelectedAddressId(address.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Truck className="h-5 w-5 mt-1" />
                        <div>
                          <p>{address.address_line1}</p>
                          {address.address_line2 && <p className="text-sm text-gray-600">{address.address_line2}</p>}
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-sm text-gray-600">{address.country}</p>
                          {address.is_default && (
                            <span className="text-emerge-gold text-sm">Default Address</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No shipping addresses found.</p>
              )}

              <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Address
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Address</DialogTitle>
                  </DialogHeader>
                  <AddressForm onSuccess={handleAddressSuccess} />
                </DialogContent>
              </Dialog>
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
