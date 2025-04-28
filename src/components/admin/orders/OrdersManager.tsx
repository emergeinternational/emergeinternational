
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import OrderFilters from "./OrderFilters";
import OrdersTable from "./OrdersTable";
import OrderDetailsView from "./OrderDetailsView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";
import type { Order } from "@/services/orderTypes";

export interface OrderStatus {
  value: string;
  label: string;
}

export interface PaymentStatus {
  value: string;
  label: string;
}

export const ORDER_STATUSES: OrderStatus[] = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
  { value: "abandoned", label: "Abandoned" }
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" }
];

export interface OrderFiltersState {
  status: string[];
  searchQuery: string;
  paymentStatus: string[];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

// Simple OrdersSummary component to fix build error
const OrdersSummary = ({ orders }: { orders: Order[] }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="text-lg font-medium">Total Orders</h3>
        <p className="text-2xl font-bold">{orders.length}</p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="text-lg font-medium">Pending</h3>
        <p className="text-2xl font-bold">
          {orders.filter(order => order.status === 'pending').length}
        </p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="text-lg font-medium">Processing</h3>
        <p className="text-2xl font-bold">
          {orders.filter(order => order.status === 'processing').length}
        </p>
      </div>
      <div className="bg-white rounded-lg p-4 shadow">
        <h3 className="text-lg font-medium">Completed</h3>
        <p className="text-2xl font-bold">
          {orders.filter(order => order.status === 'completed').length}
        </p>
      </div>
    </div>
  );
};

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
          profiles:user_id(id, full_name, email),
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
      <div className="flex justify-between mb-6">
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
      </div>
      
      {/* Orders List / Details View */}
      {selectedOrder ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <button 
            onClick={handleCloseDetails}
            className="mb-4 text-blue-600 hover:underline flex items-center"
          >
            &larr; Back to all orders
          </button>
          <h2 className="text-2xl font-bold mb-4">Order Details: {selectedOrder.id}</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Order Information</h3>
              <p><strong>Status:</strong> {selectedOrder.status}</p>
              <p><strong>Date:</strong> {new Date(selectedOrder.created_at || "").toLocaleString()}</p>
              <p><strong>Total:</strong> ${selectedOrder.total_amount}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Customer Information</h3>
              <p><strong>Name:</strong> {selectedOrder.profiles?.full_name || "N/A"}</p>
              <p><strong>Email:</strong> {selectedOrder.profiles?.email || "N/A"}</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Order Items</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Product</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Quantity</th>
                  <th className="p-2 text-left">Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.order_items?.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.product_name}</td>
                    <td className="p-2">${item.unit_price}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">${item.unit_price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Update Status</h3>
            <div className="flex space-x-2">
              {ORDER_STATUSES.map(status => (
                <button
                  key={status.value}
                  onClick={() => handleUpdateStatus(selectedOrder.id, status.value)}
                  disabled={selectedOrder.status === status.value}
                  className={`px-3 py-1 rounded ${
                    selectedOrder.status === status.value
                      ? "bg-blue-200 text-blue-800"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
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
            <div className="bg-white p-6 rounded-lg shadow">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Order ID</th>
                    <th className="p-2 text-left">Customer</th>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Total</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">Loading orders...</td>
                    </tr>
                  ) : filteredOrders?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center">No orders found</td>
                    </tr>
                  ) : (
                    filteredOrders?.map(order => (
                      <tr key={order.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{order.id.substring(0, 8)}...</td>
                        <td className="p-2">{order.profiles?.full_name || 'Unknown'}</td>
                        <td className="p-2">{new Date(order.created_at || "").toLocaleDateString()}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-2">${order.total_amount}</td>
                        <td className="p-2">
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="text-blue-600 hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
          
          {["pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
            <TabsContent key={status} value={status} className="mt-0">
              <div className="bg-white p-6 rounded-lg shadow">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Order ID</th>
                      <th className="p-2 text-left">Customer</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Total</th>
                      <th className="p-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center">Loading orders...</td>
                      </tr>
                    ) : filteredOrders?.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center">No orders found</td>
                      </tr>
                    ) : (
                      filteredOrders?.map(order => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{order.id.substring(0, 8)}...</td>
                          <td className="p-2">{order.profiles?.full_name || 'Unknown'}</td>
                          <td className="p-2">{new Date(order.created_at || "").toLocaleDateString()}</td>
                          <td className="p-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-2">${order.total_amount}</td>
                          <td className="p-2">
                            <button
                              onClick={() => handleViewOrder(order.id)}
                              className="text-blue-600 hover:underline"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
      <Toaster />
    </div>
  );
};

export default OrdersManager;
