
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Order } from "@/types/orderTypes";
import OrdersTable from "./OrdersTable";
import OrderDetailsDialog from "./OrderDetailsDialog";
import { Search, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

const OrdersManagerNew = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items(*),
          profiles:user_id(full_name, email),
          shipping_addresses:shipping_address_id(*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });

  const filteredOrders = orders?.filter((order) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    const customerName = order.profiles?.full_name?.toLowerCase() || "";
    const customerEmail = order.profiles?.email?.toLowerCase() || "";
    const orderId = order.id.toLowerCase();
    const orderStatus = order.status.toLowerCase();
    
    return (
      customerName.includes(query) ||
      customerEmail.includes(query) ||
      orderId.includes(query) ||
      orderStatus.includes(query)
    );
  });

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleCloseOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  useEffect(() => {
    // Handle query errors with a toast notification
    if (error) {
      toast({
        title: "Failed to load orders",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Orders</h2>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search orders..."
              className="pl-8 w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCcw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      <OrdersTable 
        orders={filteredOrders || []} 
        isLoading={isLoading} 
        onViewDetails={handleViewOrderDetails}
        onRefresh={refetch}
      />

      {selectedOrder && (
        <OrderDetailsDialog
          order={selectedOrder}
          open={showOrderDetails}
          onOpenChange={handleCloseOrderDetails}
          onUpdate={refetch}
        />
      )}
    </div>
  );
};

export default OrdersManagerNew;
