import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  PackageCheck,
  Package,
  Truck,
  RotateCcw 
} from "lucide-react";
import { Order, OrdersTableProps } from "@/types/orderTypes";

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(date);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="outline" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    case "processing":
      return <Badge variant="secondary" className="flex items-center gap-1"><Package className="h-3 w-3" /> Processing</Badge>;
    case "completed":
      return <Badge className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200"><CheckCircle2 className="h-3 w-3" /> Completed</Badge>;
    case "cancelled":
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Cancelled</Badge>;
    case "shipped":
      return <Badge className="flex items-center gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200"><Truck className="h-3 w-3" /> Shipped</Badge>;
    case "delivered":
      return <Badge className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-200"><PackageCheck className="h-3 w-3" /> Delivered</Badge>;
    case "refunded":
      return <Badge variant="outline" className="flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-200"><RotateCcw className="h-3 w-3" /> Refunded</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const OrdersTable = ({ orders, isLoading, onRefresh, onViewDetails }: OrdersTableProps) => {
  const sortedOrders = useMemo(() => {
    if (!orders) return [];
    
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.created_at || "");
      const dateB = new Date(b.created_at || "");
      return dateB.getTime() - dateA.getTime();
    });
  }, [orders]);

  const renderCustomerInfo = (order: Order) => {
    if (!order.profiles) {
      return <span className="text-gray-400 italic">Unknown customer</span>;
    }
    
    return (
      <div>
        <div className="font-medium">{order.profiles.full_name || "No name"}</div>
        <div className="text-sm text-gray-500">{order.profiles.email || "No email"}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm p-8 text-center">
        <h3 className="font-semibold text-lg mb-2">No Orders Found</h3>
        <p className="text-gray-500 mb-4">There are no orders to display at this time.</p>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            Refresh
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell>{renderCustomerInfo(order)}</TableCell>
              <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
              <TableCell className="text-right">
                {formatCurrency(order.total_amount)}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails && onViewDetails(order)}
                >
                  <Eye className="h-4 w-4 mr-1" /> Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;
