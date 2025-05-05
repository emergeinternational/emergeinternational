
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Toaster } from "sonner";
import { useAuth } from './hooks/useAuth';
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import ProductManagementPage from "./pages/admin/ProductManagementPage";
import AdminLayout from "./layouts/AdminLayout";

const App: React.FC = () => {
  const { user, userRole } = useAuth();
  const isAuthenticated = !!user;

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Shop />,
    },
    {
      path: "/shop",
      element: <Shop />,
    },
    {
      path: "/shop/product/:id",
      element: <ProductDetail />,
    },
    {
      path: "/admin/product-management",
      element: isAuthenticated ? (
        <AdminLayout>
          <ProductManagementPage />
        </AdminLayout>
      ) : (
        <Shop />
      ),
    },
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;
