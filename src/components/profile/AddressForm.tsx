
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface AddressFormProps {
  address?: {
    id: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
  };
  onSuccess: () => void;
}

const AddressForm = ({ address, onSuccess }: AddressFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: address || {
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      country: "",
      is_default: false
    }
  });

  const onSubmit = async (data: any) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      if (address) {
        const { error } = await supabase
          .from('shipping_addresses')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .match({ id: address.id });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Address updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('shipping_addresses')
          .insert({
            ...data,
            user_id: user.id
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Address added successfully"
        });
      }
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="address_line1">Address Line 1</Label>
        <Input
          id="address_line1"
          {...register("address_line1", { required: true })}
          placeholder="Street address"
        />
        {errors.address_line1 && (
          <span className="text-red-500 text-sm">This field is required</span>
        )}
      </div>

      <div>
        <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
        <Input
          id="address_line2"
          {...register("address_line2")}
          placeholder="Apartment, suite, etc."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            {...register("city", { required: true })}
            placeholder="City"
          />
          {errors.city && (
            <span className="text-red-500 text-sm">This field is required</span>
          )}
        </div>

        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            {...register("state", { required: true })}
            placeholder="State"
          />
          {errors.state && (
            <span className="text-red-500 text-sm">This field is required</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            {...register("postal_code", { required: true })}
            placeholder="Postal code"
          />
          {errors.postal_code && (
            <span className="text-red-500 text-sm">This field is required</span>
          )}
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            {...register("country", { required: true })}
            placeholder="Country"
          />
          {errors.country && (
            <span className="text-red-500 text-sm">This field is required</span>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="is_default"
          {...register("is_default")}
          className="form-checkbox h-4 w-4"
        />
        <Label htmlFor="is_default">Set as default address</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : address ? "Update Address" : "Add Address"}
      </Button>
    </form>
  );
};

export default AddressForm;
