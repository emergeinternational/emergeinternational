
import React from "react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft } from "lucide-react";
import { ORDER_STATUSES } from "./OrdersManagerNew";
import { Order } from "@/services/orderTypes";

interface OrderDetailsViewProps {
  order: Order;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string) => Promise<boolean>;
}

const OrderDetailsViewNew = ({ order, onClose, onStatusUpdate }: OrderDetailsViewProps) => {
  // Status color helpers
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "shipped": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "delivered": return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "refunded": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      case "refunded": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Calculate order totals
  const calculateTotals = () => {
    if (!order.order_items || order.order_items.length === 0) {
      return { subtotal: 0, total: Number(order.total_amount || 0) };
    }
    
    const subtotal = order.order_items.reduce((sum, item) => {
      return sum + (Number(item.unit_price) * Number(item.quantity));
    }, 0);
    
    return {
      subtotal,
      total: Number(order.total_amount || subtotal)
    };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onClose} 
          className="flex items-center gap-1 hover:bg-transparent hover:text-blue-600"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Orders
        </Button>
        <div className="flex space-x-2">
          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
          {order.payment_status && (
            <Badge className={getPaymentStatusColor(order.payment_status)}>
              Payment: {order.payment_status}
            </Badge>
          )}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Order #{order.id.slice(0, 8)}</h3>
        <p className="text-sm text-gray-500">
          {order.created_at 
            ? `Placed on ${format(new Date(order.created_at), "MMMM dd, yyyy 'at' h:mm a")}`
            : "Date not available"
          }
        </p>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="customer">Customer Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {!order.order_items || order.order_items.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No items in this order</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.order_items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell className="text-right">ETB {item.unit_price}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ETB {Number(item.unit_price) * Number(item.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-medium">
                        Subtotal
                      </TableCell>
                      <TableCell className="text-right">
                        ETB {totals.subtotal.toFixed(2)}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} className="text-right font-bold">
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        ETB {totals.total.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-gray-500">
                    {order.payment_method || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Status</p>
                  <Badge className={getPaymentStatusColor(order.payment_status)}>
                    {order.payment_status || "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-sm text-gray-500">
                  {order.user?.full_name || "Not available"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-gray-500">
                  {order.user?.email || "Not available"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Phone Number</p>
                <p className="text-sm text-gray-500">
                  {order.user?.phone_number || "Not available"}
                </p>
              </div>
            </CardContent>
          </Card>

          {order.shipping_address_id && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                {order.shipping_addresses ? (
                  <div className="space-y-1 text-sm">
                    <p>{order.shipping_addresses.address_line1}</p>
                    {order.shipping_addresses.address_line2 && <p>{order.shipping_addresses.address_line2}</p>}
                    <p>
                      {order.shipping_addresses.city}, {order.shipping_addresses.state} {order.shipping_addresses.postal_code}
                    </p>
                    <p>{order.shipping_addresses.country}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Shipping address information not loaded</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Update Order Status</h3>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map(status => (
            <Button
              key={status.value}
              variant={order.status === status.value ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusUpdate(order.id, status.value)}
              disabled={order.status === status.value}
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsViewNew;
