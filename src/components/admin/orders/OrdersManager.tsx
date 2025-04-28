
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import OrdersTable from "./OrdersTable";
import OrdersSummary from "./OrdersSummary";
import OrderFilters from "./OrderFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderDetailsView from "./OrderDetailsView";
import { Toaster } from "@/components/ui/toaster";

const OrdersManager = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch all orders with order items and customer info
  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*),
          profiles:user_id(full_name, email, phone_number),
          shipping_addresses:shipping_address_id(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Filter orders based on status and search query
  const filteredOrders = orders?.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    
    const matchesSearch = 
      searchQuery === "" || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (order.profiles?.full_name && order.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.profiles?.email && order.profiles.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Handler for clicking on an order to view details
  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  // Handler for closing the order details view
  const handleCloseDetails = () => {
    setSelectedOrderId(null);
  };

  // Handler for updating the order status
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      
      if (error) throw error;
      
      refetch();
      return true;
    } catch (err) {
      console.error("Error updating order status:", err);
      return false;
    }
  };

  // Get selected order details
  const selectedOrder = selectedOrderId 
    ? orders?.find(order => order.id === selectedOrderId) 
    : null;
  
  return (
    <div className="space-y-6">
      {/* Order Summary Stats */}
      <OrdersSummary orders={orders || []} />
      
      {/* Filters and Search */}
      <OrderFilters 
        filterStatus={filterStatus} 
        onFilterChange={setFilterStatus}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      {/* Orders List / Details View */}
      {selectedOrder ? (
        <OrderDetailsView 
          order={selectedOrder} 
          onClose={handleCloseDetails} 
          onUpdateStatus={handleUpdateStatus}
          onRefresh={refetch}
        />
      ) : (
        <Tabs defaultValue="all" value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="processing">Processing</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <OrdersTable 
              orders={filteredOrders || []} 
              isLoading={isLoading} 
              onViewOrder={handleViewOrder} 
              onUpdateStatus={handleUpdateStatus}
              onRefresh={refetch}
            />
          </TabsContent>
          
          {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
            <TabsContent key={status} value={status} className="mt-0">
              <OrdersTable 
                orders={filteredOrders || []} 
                isLoading={isLoading} 
                onViewOrder={handleViewOrder} 
                onUpdateStatus={handleUpdateStatus}
                onRefresh={refetch}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}
      <Toaster />
    </div>
  );
};

export default OrdersManager;
