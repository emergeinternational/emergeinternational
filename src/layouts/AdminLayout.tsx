
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import ErrorBoundary from "@/components/shop/ErrorBoundary";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Admin header */}
        <ErrorBoundary fallback={
          <header className="bg-gray-900 text-white shadow-md">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>
          </header>
        }>
          <header className="bg-gray-900 text-white shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <div className="flex items-center space-x-4">
                <Link to="/shop">
                  <Button variant="ghost" size="sm" className="text-white hover:text-white">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Shop
                  </Button>
                </Link>
              </div>
            </div>
          </header>
        </ErrorBoundary>
        
        {/* Admin content */}
        <main className="py-6">
          <ErrorBoundary fallback={
            <div className="container mx-auto px-4">
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
                <h2 className="font-bold text-lg">Admin Module Error</h2>
                <p>An error occurred while loading the admin module. Please try again later.</p>
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={() => window.location.reload()}
                >
                  Reload Page
                </Button>
              </div>
            </div>
          }>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default AdminLayout;
