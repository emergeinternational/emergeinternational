
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import OrdersTableNew from "./OrdersTableNew";
import OrdersSummaryNew from "./OrdersSummaryNew";
import OrderFiltersNew from "./OrderFiltersNew";
import OrderDetailsViewNew from "./OrderDetailsViewNew";
import { useToast } from "@/hooks/use-toast";
import { Order } from "@/services/orderTypes";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";

// Order status options
export const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" }
];

// Payment status options
export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" }
];

// Filter state interface
export interface OrderFiltersState {
  status: string;
  searchQuery: string;
}

const OrdersManagerNew = () => {
  const { toast } = useToast();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filters, setFilters] = useState<OrderFiltersState>({
    status: "all",
    searchQuery: ""
  });

  // Set up realtime updates
  const { isSubscribed } = useOrdersRealtime(() => {
    refetch();
    toast({
      title: "Orders Updated",
      description: "The orders list has been refreshed with the latest data.",
    });
  });
  
  // Fetch orders with related data - using separate queries to avoid relationship issues
  const { 
    data: orders = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      // First, fetch the orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order('created_at', { ascending: false });

      if (ordersError) {
        throw ordersError;
      }

      // For each order, fetch the related items, user info, and shipping address
      const ordersWithDetails = await Promise.all(ordersData.map(async (order) => {
        // Fetch order items
        const { data: orderItems } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", order.id);
        
        // Fetch user info
        const { data: userInfo } = await supabase
          .from("profiles")
          .select("full_name, email, phone_number")
          .eq("id", order.user_id)
          .single();
        
        // Fetch shipping address if exists
        let shippingAddress = null;
        if (order.shipping_address_id) {
          const { data: addressData } = await supabase
            .from("shipping_addresses")
            .select("*")
            .eq("id", order.shipping_address_id)
            .single();
          
          shippingAddress = addressData;
        }
        
        // Assemble the complete order object
        return {
          ...order,
          order_items: orderItems || [],
          user: userInfo || {},
          shipping_addresses: shippingAddress
        };
      }));
      
      return ordersWithDetails as Order[];
    },
  });

  // Filter orders based on status and search
  const filteredOrders = orders.filter((order) => {
    // Status filter
    const statusMatch = filters.status === "all" || order.status === filters.status;
    
    // Search filter for ID, customer name, or email
    const searchMatch = !filters.searchQuery ? true : (
      order.id.toLowerCase().includes(filters.searchQuery.toLowerCase()) || 
      (order.user?.full_name && order.user.full_name.toLowerCase().includes(filters.searchQuery.toLowerCase())) ||
      (order.user?.email && order.user.email.toLowerCase().includes(filters.searchQuery.toLowerCase()))
    );
    
    return statusMatch && searchMatch;
  });

  // Calculate order statistics for summary
  const orderStats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(order => order.status === "pending").length,
    completedOrders: orders.filter(order => ["delivered", "completed"].includes(order.status)).length,
    cancelledOrders: orders.filter(order => order.status === "cancelled").length,
    totalRevenue: orders
      .filter(order => ["delivered", "completed"].includes(order.status))
      .reduce((sum, order) => sum + Number(order.total_amount || 0), 0)
  };

  // Handle order selection for details view
  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  // Close order details view
  const handleCloseDetails = () => {
    setSelectedOrderId(null);
  };

  // Update order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", orderId);
      
      if (error) throw error;
      
      toast({
        title: "Order Updated",
        description: `Order status changed to ${newStatus}`,
      });
      
      refetch();
      return true;
    } catch (err: any) {
      toast({
        title: "Error updating order",
        description: err.message,
        variant: "destructive"
      });
      console.error("Error updating order status:", err);
      return false;
    }
  };

  // Get selected order
  const selectedOrder = selectedOrderId 
    ? orders.find(order => order.id === selectedOrderId)
    : null;
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Error loading orders</h3>
        <p className="mt-1 text-sm text-red-700">
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </p>
        <button 
          onClick={() => refetch()} 
          className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary Stats */}
      <OrdersSummaryNew summary={orderStats} />
      
      {/* Filters and Search */}
      <OrderFiltersNew 
        filters={filters} 
        setFilters={setFilters}
      />
      
      {/* Order Details or Order List */}
      {selectedOrder ? (
        <OrderDetailsViewNew 
          order={selectedOrder} 
          onClose={handleCloseDetails} 
          onStatusUpdate={handleUpdateStatus}
        />
      ) : (
        <OrdersTableNew 
          orders={filteredOrders} 
          isLoading={isLoading} 
          onStatusUpdate={handleUpdateStatus}
          onViewOrder={handleViewOrder}
          onRefresh={refetch}
        />
      )}
    </div>
  );
};

export default OrdersManagerNew;
