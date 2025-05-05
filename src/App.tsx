
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import Shop from "./pages/Shop";
import ShopPage from "./pages/ShopPage";
import ProductDetail from "./pages/ProductDetail";
import { getAuthStatus } from './services/shopAuthService'; // Fix imports to use only what exists

const App: React.FC = () => {
  // Initialize auth state at app startup
  React.useEffect(() => {
    // Just check auth status instead of calling missing functions
    console.log("App starting, checking auth:", getAuthStatus());
  }, []);

  // Include Shop module routes and admin route
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Shop userRole={null} />,
    },
    {
      path: "/shop",
      element: <ShopPage />,
    },
    {
      path: "/shop/product/:id",
      element: <ProductDetail />,
    },
    {
      path: "/admin/product-management",
      element: <ShopPage />,
    },
    // All other routes are commented out to maintain module isolation
    // Admin routes, talent routes, etc. are removed
  ]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;
