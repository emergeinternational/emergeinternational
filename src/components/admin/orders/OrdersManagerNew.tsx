import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import OrderFiltersNew from "./OrderFiltersNew";
import OrdersTableNew from "./OrdersTableNew";
import OrderDetailsViewNew from "./OrderDetailsViewNew";
import type { Order } from "@/services/orderTypes";

export interface OrderStatus {
  value: string;
  label: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" }
];

export interface OrderFiltersState {
  status: string;
  searchQuery: string;
}

const OrdersManagerNew = () => {
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [filters, setFilters] = useState<OrderFiltersState>({
    status: "all",
    searchQuery: "",
  });

  const {
    data: orders,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["orders", filters],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          user:profiles (
            full_name,
            email,
            phone_number
          ),
          order_items (
            *,
            product_name
          ),
          shipping_addresses(*)
        `
        )
        .order("created_at", { ascending: false });

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters.searchQuery) {
        const searchQuery = `%${filters.searchQuery}%`;
        query = query.or(
          `id.ilike.${searchQuery},user.full_name.ilike.${searchQuery},user.email.ilike.${searchQuery}`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Order[];
    },
  });

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order status:", error);
        toast({
          title: "Error updating status",
          description: "Failed to update the order status.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Status updated",
        description: "Order status updated successfully.",
      });
      refetch(); // Refresh orders
      return true;
    } catch (err) {
      console.error("Unexpected error updating order status:", err);
      toast({
        title: "Unexpected error",
        description: "An unexpected error occurred while updating the status.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <OrderFiltersNew filters={filters} setFilters={setFilters} />
      <OrdersTableNew
        orders={orders || []}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
      />
      {isDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black/50">
          <div className="relative m-4 md:m-12 lg:m-20 bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <OrderDetailsViewNew
                order={selectedOrder}
                onClose={handleCloseDetails}
                onStatusUpdate={handleStatusUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagerNew;
