import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Order } from "@/types/orderTypes";
import { OrderDetailsView } from './OrderDetailsView';

interface OrderDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ 
  isOpen, 
  onClose, 
  order 
}) => {
  if (!order) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Order #{order.id.substring(0, 8)}</DialogTitle>
        </DialogHeader>
        <OrderDetailsView 
          order={order}
          onStatusChange={(newStatus) => {
            // This function will be implemented in the OrderDetailsView component
            // No need to pass it up to OrdersManager anymore
          }} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;
