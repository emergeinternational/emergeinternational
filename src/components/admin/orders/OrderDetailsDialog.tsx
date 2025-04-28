
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Order } from '@/types/orderTypes';

interface OrderDetailsDialogProps {
  order: Order;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

const OrderDetailsDialog = ({ order, open, onOpenChange, onUpdate }: OrderDetailsDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{order.id.substring(0, 8)}... placed on {formatDate(order.created_at)}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">Customer Information</h3>
              <p className="font-medium">{order.profiles?.full_name || 'Unknown Customer'}</p>
              <p>{order.profiles?.email || 'No email provided'}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-500">Order Status</h3>
              <p className="font-medium capitalize">{order.status}</p>
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-500">Payment Method</h3>
              <p>{order.payment_method || 'Not specified'}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-sm text-gray-500">Shipping Address</h3>
              {order.shipping_addresses ? (
                <>
                  <p>{order.shipping_addresses.address_line1}</p>
                  <p>{order.shipping_addresses.city}, {order.shipping_addresses.state} {order.shipping_addresses.postal_code}</p>
                  <p>{order.shipping_addresses.country}</p>
                </>
              ) : (
                <p>No shipping address provided</p>
              )}
            </div>
            
            <div>
              <h3 className="font-medium text-sm text-gray-500">Order Date</h3>
              <p>{formatDate(order.created_at)}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 py-4">
          <h3 className="font-medium text-gray-500">Order Items</h3>
          <div className="border rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {order.order_items && order.order_items.length > 0 ? (
                  order.order_items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{item.product_name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-center">{item.quantity}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(item.quantity * item.unit_price)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm text-center text-gray-500">No items in this order</td>
                  </tr>
                )}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium">Order Total:</td>
                  <td className="px-4 py-3 text-right text-sm font-bold">{formatCurrency(order.total_amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
