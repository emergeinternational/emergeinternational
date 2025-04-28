
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrderSummaryStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  abandonedOrders: number;
  totalRevenue: number;
}

interface OrdersSummaryProps {
  summary: OrderSummaryStats;
}

const OrdersSummary = ({ summary }: OrdersSummaryProps) => {
  const { totalOrders, pendingOrders, completedOrders, abandonedOrders, totalRevenue } = summary;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground">All orders</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingOrders}</div>
          <p className="text-xs text-muted-foreground">
            {pendingOrders > 0
              ? `${((pendingOrders / totalOrders) * 100).toFixed(1)}% of total orders`
              : "No pending orders"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedOrders}</div>
          <p className="text-xs text-muted-foreground">
            {completedOrders > 0
              ? `${((completedOrders / totalOrders) * 100).toFixed(1)}% of total orders`
              : "No completed orders"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">ETB {totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            From completed orders
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersSummary;
