import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import OrdersTable from './OrdersTable';
import OrdersSummary from './OrdersSummary';
import OrderDetailsDialog from './OrderDetailsDialog';
import { Order, OrderStatus } from '@/types/orderTypes';

const OrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_address:shipping_address_id(*),
          order_items(*),
          profiles(*)
        `);

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleDetailsClose = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        return;
      }

      // Optimistically update the order in the local state
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      // If the selected order is updated, update the selected order state as well
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  return (
    <div className="space-y-4">
      <OrdersSummary orders={orders} />
      <OrdersTable
        orders={orders}
        loading={loading}
        onOrderSelect={handleOrderSelect}
      />
      <OrderDetailsDialog
        isOpen={isDetailsOpen}
        onClose={handleDetailsClose}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default OrdersManager;
