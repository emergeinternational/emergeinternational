
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import { getAuthStatus } from './services/shopAuthService'; // Fix imports to use only what exists

const App: React.FC = () => {
  // Initialize auth state at app startup
  React.useEffect(() => {
    // Just check auth status instead of calling missing functions
    console.log("App starting, checking auth:", getAuthStatus());
  }, []);

  // Only include Shop module routes
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
