
import React from "react";
import AdminLayout from "../../layouts/AdminLayout";
import ProductsManager from "../../components/admin/shop/ProductsManager";
import { Toaster } from "@/components/ui/toaster";

const ProductsPage = () => {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Products Management</h1>
          <p className="text-sm text-gray-500">
            Manage, create, and update product listings
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <ProductsManager />
        </div>
      </div>
      <Toaster />
    </AdminLayout>
  );
};

export default ProductsPage;
