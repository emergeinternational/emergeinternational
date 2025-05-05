
import React from 'react';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import Shop from "./pages/Shop";
import ShopPage from "./pages/ShopPage";
import ProductDetail from "./pages/ProductDetail";
import MyProductsPage from "./pages/MyProductsPage";
import ProductApprovalsPage from "./pages/ProductApprovalsPage";
import { getAuthStatus } from './services/shopAuthService';
import ErrorBoundary from './components/shop/ErrorBoundary';

const App: React.FC = () => {
  // Initialize auth state at app startup
  React.useEffect(() => {
    // Check auth status
    console.log("App starting, checking auth:", getAuthStatus());
  }, []);

  // Create a route-level error boundary component
  const RouteErrorBoundary: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <ErrorBoundary
      fallback={
        <div className="container mx-auto p-8">
          <div className="bg-red-100 border-red-300 text-red-700 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-2">Route Error</h2>
            <p className="mb-4">Sorry, something went wrong loading this page.</p>
            <button 
              className="bg-red-700 text-white px-4 py-2 rounded"
              onClick={() => window.location.href = '/'}
            >
              Go to Home Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );

  // Include Shop module routes and admin route with error boundaries
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <RouteErrorBoundary>
          <Shop userRole={null} />
        </RouteErrorBoundary>
      ),
    },
    {
      path: "/shop",
      element: (
        <RouteErrorBoundary>
          <ShopPage />
        </RouteErrorBoundary>
      ),
    },
    {
      path: "/shop/product/:id",
      element: (
        <RouteErrorBoundary>
          <ProductDetail />
        </RouteErrorBoundary>
      ),
    },
    {
      path: "/my-products",
      element: (
        <RouteErrorBoundary>
          <MyProductsPage />
        </RouteErrorBoundary>
      ),
    },
    {
      path: "/admin/product-approvals",
      element: (
        <RouteErrorBoundary>
          <ProductApprovalsPage />
        </RouteErrorBoundary>
      ),
    },
    {
      path: "/admin/product-management",
      element: (
        <RouteErrorBoundary>
          <ShopPage />
        </RouteErrorBoundary>
      ),
    },
    // All other routes are commented out to maintain module isolation
    // Admin routes, talent routes, etc. are removed
  ]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster />
    </ErrorBoundary>
  );
};

export default App;
