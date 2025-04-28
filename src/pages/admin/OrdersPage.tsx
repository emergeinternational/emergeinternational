
import React from 'react';
import AdminLayout from "@/layouts/AdminLayout";
import OrdersManager from "@/components/admin/orders/OrdersManager";
import { Toaster } from "@/components/ui/toaster";

const OrdersPage = () => {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold mb-6">Orders Management</h1>
        <OrdersManager />
        <Toaster />
      </div>
    </AdminLayout>
  );
};

export default OrdersPage;
