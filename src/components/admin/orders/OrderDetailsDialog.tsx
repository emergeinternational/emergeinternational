
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Order, OrderItem } from "@/types/orderTypes";
import { Badge } from '@/components/ui/badge';
import { formatCurrency, getStatusColor } from './OrderHelper';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface OrderDetailsProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsProps> = ({ order, isOpen, onClose }) => {
  const { data: orderItems } = useQuery({
    queryKey: ['orderItems', order?.id],
    queryFn: async () => {
      if (!order?.id) return [];
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
        
      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!order?.id
  });
  
  const { data: profile } = useQuery({
    queryKey: ['userProfile', order?.user_id],
    queryFn: async () => {
      if (!order?.user_id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', order.user_id)
        .single();
        
      if (error) return null;
      return data;
    },
    enabled: !!order?.user_id
  });

  const { data: shippingAddress } = useQuery({
    queryKey: ['shippingAddress', order?.shipping_address_id],
    queryFn: async () => {
      if (!order?.shipping_address_id) return null;
      const { data, error } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('id', order.shipping_address_id)
        .single();
        
      if (error) return null;
      return data;
    },
    enabled: !!order?.shipping_address_id
  });

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Order Details: #{order.id.substring(0, 8)}</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Order Information</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Status:</span>
                <Badge className={getStatusColor(order.status as any)}>
                  {order.status}
                </Badge>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Date:</span>
                <span>{new Date(order.created_at || '').toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">Payment Method:</span>
                <span>{order.payment_method || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total:</span>
                <span className="font-medium">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Customer Information</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="mb-2">
                <span className="text-gray-500">Name:</span>
                <span className="block font-medium">{profile?.full_name || "Not provided"}</span>
              </div>
              <div className="mb-2">
                <span className="text-gray-500">Email:</span>
                <span className="block">{profile?.email || "Not provided"}</span>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>
                <span className="block">{profile?.phone_number || "Not provided"}</span>
              </div>
            </div>
          </div>
        </div>
        
        {shippingAddress && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Shipping Address</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p>{shippingAddress.address_line1}</p>
              {shippingAddress.address_line2 && <p>{shippingAddress.address_line2}</p>}
              <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}</p>
              <p>{shippingAddress.country}</p>
            </div>
          </div>
        )}
        
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Order Items</h3>
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="py-2 px-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderItems && orderItems.length > 0 ? (
                orderItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 px-3 text-sm">{item.product_name}</td>
                    <td className="py-2 px-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-2 px-3 text-sm text-right">{item.quantity}</td>
                    <td className="py-2 px-3 text-sm text-right">{formatCurrency(item.unit_price * item.quantity)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-sm text-gray-500">
                    No items found for this order
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="py-2 px-3 text-right font-medium">Total:</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(order.total_amount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
