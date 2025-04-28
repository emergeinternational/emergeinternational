
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
import { ORDER_STATUSES } from "./OrdersManager";

interface OrderDetailsViewProps {
  order: any;
  onStatusUpdate: (orderId: string, status: string) => Promise<void>;
}

const OrderDetailsView = ({ order, onStatusUpdate }: OrderDetailsViewProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "shipped": return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "delivered": return "bg-purple-100 text-purple-800 border-purple-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "refunded": return "bg-orange-100 text-orange-800 border-orange-200";
      case "abandoned": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
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
    
    const subtotal = order.order_items.reduce((sum: number, item: any) => {
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
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">Order #{order.id.slice(0, 8)}</h3>
          <p className="text-sm text-gray-500">
            Placed on {format(new Date(order.created_at), "MMMM dd, yyyy 'at' h:mm a")}
          </p>
        </div>
        <div className="space-x-2">
          <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
          {order.payment_status && (
            <Badge className={getPaymentStatusColor(order.payment_status)}>
              Payment: {order.payment_status}
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="customer">Customer Details</TabsTrigger>
          <TabsTrigger value="history">Order History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-4">
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
                    {order.order_items.map((item: any) => (
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
                  <Badge className={getPaymentStatusColor(order.payment_status || "pending")}>
                    {order.payment_status || "Pending"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customer" className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              {!order.shipping_address_id ? (
                <p className="text-gray-500">No shipping address specified</p>
              ) : (
                <p className="text-gray-500">Shipping address information not loaded</p>
                // In a real implementation, you'd fetch the shipping address data
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>Status updates and changes to this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-md p-4">
                <p className="text-sm">
                  <span className="font-medium">Order Created</span> - {format(new Date(order.created_at), "MMMM dd, yyyy 'at' h:mm a")}
                </p>
              </div>
              
              {order.updated_at && new Date(order.updated_at).getTime() > new Date(order.created_at).getTime() && (
                <div className="border rounded-md p-4">
                  <p className="text-sm">
                    <span className="font-medium">Order Updated</span> - {format(new Date(order.updated_at), "MMMM dd, yyyy 'at' h:mm a")}
                  </p>
                </div>
              )}
              
              {/* In a full implementation, you would fetch and display a complete history log */}
              <div className="text-center text-sm text-gray-500 pt-2">
                Limited history available. Implement full history tracking for more details.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Update Order Status</h3>
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map(statusOption => (
            <Button
              key={statusOption.value}
              variant={order.status === statusOption.value ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusUpdate(order.id, statusOption.value)}
              disabled={order.status === statusOption.value}
            >
              {statusOption.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsView;
