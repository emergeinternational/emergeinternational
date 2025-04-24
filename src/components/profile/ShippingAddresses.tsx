
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import AddressForm from "./AddressForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ShippingAddress {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

const ShippingAddresses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShippingAddress | null>(null);

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

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
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase
      .from('shipping_addresses')
      .delete()
      .match({ id });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive"
      });
      return;
    }

    await loadAddresses();
    toast({
      title: "Success",
      description: "Address deleted successfully"
    });
  };

  const setDefaultAddress = async (id: string) => {
    const { error } = await supabase
      .from('shipping_addresses')
      .update({ is_default: true })
      .match({ id });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to set default address",
        variant: "destructive"
      });
      return;
    }

    await loadAddresses();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-white mb-4">Shipping Addresses</h2>
      
      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="bg-white/5 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white">{address.address_line1}</p>
                {address.address_line2 && <p className="text-gray-400">{address.address_line2}</p>}
                <p className="text-gray-400">
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p className="text-gray-400">{address.country}</p>
                {address.is_default && (
                  <span className="text-emerge-gold text-sm mt-1">Default Address</span>
                )}
              </div>
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-white"
                      onClick={() => setEditingAddress(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Address</DialogTitle>
                    </DialogHeader>
                    <AddressForm
                      address={address}
                      onSuccess={() => {
                        setEditingAddress(null);
                        loadAddresses();
                      }}
                    />
                  </DialogContent>
                </Dialog>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-red-500"
                  onClick={() => deleteAddress(address.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                {!address.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-emerge-gold border-emerge-gold hover:bg-emerge-gold/10"
                    onClick={() => setDefaultAddress(address.id)}
                  >
                    Set as Default
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={isAddingNew} onOpenChange={setIsAddingNew}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add New Address
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
          </DialogHeader>
          <AddressForm
            onSuccess={() => {
              setIsAddingNew(false);
              loadAddresses();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShippingAddresses;
