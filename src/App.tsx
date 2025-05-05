
import React, { useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { Toaster } from "sonner";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import ProductManagementPage from "./pages/admin/ProductManagementPage";
import AdminLayout from "./layouts/AdminLayout";
import { initializeAuth, setupAuthListener, getAuthStatus } from './services/authService';

const App: React.FC = () => {
  // Initialize auth state at app startup
  useEffect(() => {
    initializeAuth();
    const cleanup = setupAuthListener();
    
    return () => {
      cleanup();
    };
  }, []);

  // Get current auth status
  const { isAuthenticated } = getAuthStatus();

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
