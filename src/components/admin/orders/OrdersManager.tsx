
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import OrdersTable from "./OrdersTable";
import OrdersSummary from "./OrdersSummary";
import OrderFilters from "./OrderFilters";
import { useToast } from "@/hooks/use-toast";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { Order } from "@/services/orderTypes";

// Define order status options
export const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
  { value: "abandoned", label: "Abandoned" },
];

// Define payment status options
export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

export interface OrderFiltersState {
  status: string[];
  paymentStatus: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  searchQuery: string;
}

// Define types for the query response
interface OrderQueryResponse {
  id: string;
  user_id: string;
  status: string;
  payment_status?: string;
  payment_method?: string;
  total_amount: number;
  shipping_address_id?: string;
  created_at?: string;
  updated_at?: string;
  user?: {
    full_name?: string;
    email?: string;
    phone_number?: string;
  };
  order_items?: Array<{
    id: string;
    order_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    created_at?: string;
  }>;
}

const OrdersManager = () => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<OrderFiltersState>({
    status: [],
    paymentStatus: [],
    dateRange: {
      from: undefined,
      to: undefined,
    },
    searchQuery: "",
  });

  // Fetch orders with filters
  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-orders", filters],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(`
          *,
          user:profiles (
            full_name,
            email,
            phone_number
          ),
          order_items (*)
        `)
        .order("created_at", { ascending: false });

      // Apply status filters
      if (filters.status.length > 0) {
        query = query.in("status", filters.status);
      }

      // Apply payment status filters
      if (filters.paymentStatus.length > 0) {
        query = query.in("payment_status", filters.paymentStatus);
      }

      // Apply date range filters
      if (filters.dateRange.from) {
        query = query.gte("created_at", filters.dateRange.from.toISOString());
      }

      if (filters.dateRange.to) {
        // Add 1 day to include the end date
        const endDate = new Date(filters.dateRange.to);
        endDate.setDate(endDate.getDate() + 1);
        query = query.lt("created_at", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Order[];
    },
  });

  // Set up realtime updates
  useOrdersRealtime(() => {
    refetch();
  });

  // Apply search filter client-side
  const filteredOrders = orders?.filter((order) => {
    if (!filters.searchQuery) return true;
    
    const searchLower = filters.searchQuery.toLowerCase();
    
    return (
      order.id.toLowerCase().includes(searchLower) ||
      (order.user?.full_name && order.user.full_name.toLowerCase().includes(searchLower)) ||
      (order.user?.email && order.user.email.toLowerCase().includes(searchLower)) ||
      (order.payment_method && order.payment_method.toLowerCase().includes(searchLower))
    );
  });

  // Calculate summary statistics
  const calculateSummary = () => {
    if (!orders) return {
      totalOrders: 0,
      pendingOrders: 0,
      completedOrders: 0,
      abandonedOrders: 0,
      totalRevenue: 0,
    };

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'completed').length,
      abandonedOrders: orders.filter(order => order.status === 'abandoned').length,
      totalRevenue: orders.reduce((sum, order) => 
        order.status === 'completed' ? sum + Number(order.total_amount || 0) : sum, 0
      ),
    };
  };

  const orderSummary = calculateSummary();

  // Handle order status updates
  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;

      toast({
        title: "Order updated",
        description: `Order #${orderId.slice(0, 8)} status changed to ${status}`,
      });
      
      // Refetch orders to update the list
      refetch();
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: "Update failed",
        description: "There was an error updating the order status.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading orders data</p>
        <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-primary text-white rounded">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <OrdersSummary summary={orderSummary} />
      <OrderFilters filters={filters} setFilters={setFilters} />
      <OrdersTable 
        orders={filteredOrders || []} 
        isLoading={isLoading}
        onStatusUpdate={handleOrderStatusUpdate}
        onRefresh={refetch}
      />
    </div>
  );
};

export default OrdersManager;
