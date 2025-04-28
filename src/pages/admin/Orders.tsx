
import React from 'react';
import AdminLayout from "@/layouts/AdminLayout";
import OrdersManager from "@/components/admin/orders/OrdersManager";

const Orders = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
        <OrdersManager />
      </div>
    </AdminLayout>
  );
};

export default Orders;
