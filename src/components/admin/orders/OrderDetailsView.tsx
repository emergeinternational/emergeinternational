import { useState } from 'react';
import { Order, OrderStatus } from '@/types/orderTypes';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from 'date-fns';
import { getStatusColor, formatCurrency, ORDER_STATUSES } from './OrderHelper';

interface OrderDetailsViewProps {
  order: Order;
  onStatusChange: (newStatus: OrderStatus) => void;
}

export const OrderDetailsView: React.FC<OrderDetailsViewProps> = ({
  order,
  onStatusChange
}) => {
  const [status, setStatus] = useState<OrderStatus>(order.status);

  const handleStatusChange = (newStatus: OrderStatus) => {
    setStatus(newStatus);
    onStatusChange(newStatus);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
        <CardDescription>
          View and manage order details.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-gray-500">Order ID</div>
            <div className="text-lg font-semibold">{order.id}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500">Order Date</div>
            <div className="text-lg font-semibold">
              {order.created_at && format(new Date(order.created_at), 'PPP')}
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">Customer</div>
          <div className="text-lg font-semibold">{order.profiles?.full_name || 'N/A'}</div>
          <div className="text-sm text-gray-500">{order.profiles?.email || 'N/A'}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">Shipping Address</div>
          <div className="text-lg font-semibold">{order.shipping_address?.address_line1 || 'N/A'}</div>
          <div className="text-sm text-gray-500">
            {order.shipping_address?.city || 'N/A'}, {order.shipping_address?.state || 'N/A'}, {order.shipping_address?.postal_code || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">{order.shipping_address?.country || 'N/A'}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">Order Items</div>
          <ul>
            {order.order_items?.map((item) => (
              <li key={item.id} className="py-2">
                {item.product_name} x {item.quantity} - {formatCurrency(item.unit_price * item.quantity)}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">Total Amount</div>
          <div className="text-lg font-semibold">{formatCurrency(order.total_amount)}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">Payment Method</div>
          <div className="text-lg font-semibold">{order.payment_method || 'N/A'}</div>
        </div>

        <div>
          <div className="text-sm font-medium text-gray-500">Status</div>
          <Badge className={getStatusColor(status)}>{status}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Update Status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardFooter>
    </Card>
  );
};
