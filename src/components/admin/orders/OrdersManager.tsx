
import React, { useState, useEffect } from 'react';
import { OrdersTable } from './OrdersTable';
import { OrdersSummary } from './OrdersSummary';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order } from '@/types/orderTypes';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import { OrderFiltersNew } from './OrderFiltersNew';

const OrdersManager = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    searchQuery: '',
    paymentStatus: '',
    dateRange: {
      from: null as Date | null,
      to: null as Date | null
    }
  });

  useEffect(() => {
    fetchOrders();
  }, [refreshKey]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Create the query
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          shipping_addresses(*),
          profiles(id, email, full_name)
        `);

      // Apply filters if any
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.searchQuery) {
        // Search by order ID or customer email/name
        query = query.or(`id.ilike.%${filters.searchQuery}%,profiles.email.ilike.%${filters.searchQuery}%,profiles.full_name.ilike.%${filters.searchQuery}%`);
      }

      if (filters.dateRange.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString());
      }

      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', toDate.toISOString());
      }

      // Execute the query
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match the Order type
      const transformedOrders: Order[] = data.map((order: any) => {
        return {
          ...order,
          customer: {
            id: order.profiles?.id || '',
            email: order.profiles?.email || '',
            full_name: order.profiles?.full_name || '',
          },
          shipping_address: order.shipping_addresses,
          items: order.order_items,
        };
      });

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status } : order
        )
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }

      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Filter orders based on the current filters
  const filteredOrders = orders;

  // Calculate summary data
  const summary = {
    total: orders.length,
    pending: orders.filter(order => order.status === 'pending').length,
    processing: orders.filter(order => order.status === 'processing').length,
    completed: orders.filter(order => order.status === 'completed').length,
    cancelled: orders.filter(order => order.status === 'cancelled').length,
  };

  // Export orders to CSV
  const exportToCSV = () => {
    // Simple CSV export implementation
    const headers = ['Order ID', 'Customer', 'Status', 'Total', 'Date'];
    const rows = orders.map(order => [
      order.id,
      order.customer?.full_name || order.customer?.email || 'Unknown',
      order.status,
      `$${order.total_amount.toFixed(2)}`,
      new Date(order.created_at || '').toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <OrdersSummary {...summary} />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <OrderFiltersNew filters={filters} onFilterChange={setFilters} />

      <OrdersTable
        orders={filteredOrders}
        isLoading={loading}
        onViewDetails={handleViewDetails}
      />

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onUpdateStatus={handleUpdateOrderStatus}
        />
      )}
    </div>
  );
};

export default OrdersManager;
